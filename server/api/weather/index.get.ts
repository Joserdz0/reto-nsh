// Definimos la interfaz para los proveedores

interface Proveedor {
  key: string;
  url: string;
  realizarConsulta(lat: string, lng: string, date: string): Promise<any>;
}

// Clases concretas que implementan la interfaz `Proveedor`
class ProveedorOpenWeatherMap implements Proveedor {
  key: string;
  url: string;

  constructor() {
    this.key = "40c503f8bd173258fd1dceb475cfad0e";
    this.url = "https://api.openweathermap.org/data/2.5/forecast";
  }
  async realizarConsulta(lat: string, lng: string, date: string): Promise<any> {
    try {
      const response = await fetch(`${this.url}?appid=${this.key}&lat=${lat}&lon=${lng}&units=metric`);
      const data = await response.json();
      const result = {
        "date": date,
        "humidity": '',  // Redondeamos a dos decimales
        "message": 'Lo sentimos la informacion es de pago'
      };
      if (data.cod !== "200") {
        return {"Error": data.message};
      } else {

        const weather = data.list.find((item: any) => item.dt_txt.split(' ')[0] === date);
        if (weather) {
          result.humidity = weather.main.humidity;
          if (weather.main.humidity < 30) {
            result.message = "Peligro. La humedad es demasiado baja para el cultivo.";
          } else if (weather.main.humidity >= 30 && weather.main.humidity < 60) {
            result.message = "Advertencia. La humedad está en niveles moderados para el cultivo.";
          } else {
            result.message = "Condiciones ideales. La humedad es adecuada para el cultivo.";
          }
        }
      }
      return result;

    } catch (error) {
      return {"Error": error};
    }
  }
}

class ProveedorWeatherApi implements Proveedor {
  key: string;
  url: string;

  constructor() {
    this.key = "ffdf6f7db9c6442489b35608251903";
    this.url = "https://api.weatherapi.com/v1/history.json";
  }

  async realizarConsulta(lat: string, lng: string, date: string): Promise<any> {
    try {
      const response = await fetch(`${this.url}?key=${this.key}&q=${lat},${lng}&dt=${date}`);
      const data = await response.json();
      const result = {
        "date": date,
        "humidity": '',  // Redondeamos a dos decimales
        "message": 'Lo sentimos la informacion es de pago'
      };
      if (data.error) {
        return {"Error": data.error.message};
      } else {

        const weather = data.forecast.forecastday[0].day.avghumidity;
        if (weather) {
          result.humidity = weather;
          if (weather < 30) {
            result.message = "Peligro. La humedad es demasiado baja para el cultivo.";
          } else if (weather >= 30 && weather < 60) {
            result.message = "Advertencia. La humedad está en niveles moderados para el cultivo.";
          } else {
            result.message = "Condiciones ideales. La humedad es adecuada para el cultivo.";
          }
        }
      }
      return result;
    } catch (error) {
      return error;
    }
  }
}

class ProveedorFake implements Proveedor {
  key: string;
  url: string;

  constructor() {
    this.key = "fake-key";
    this.url = "fake-url";
  }

  async realizarConsulta(lat: string, lng: string, date: string): Promise<any> {
    try {
      // Genera un valor aleatorio entre 0 y 100 para la humedad
      const humedad = Math.random() * 100;
  
      // Determina el mensaje según el valor de la humedad
      let mensaje = "";
      if (humedad < 30) {
        mensaje = "Peligro. La humedad es demasiado baja para el cultivo.";
      } else if (humedad >= 30 && humedad < 60) {
        mensaje = "Advertencia. La humedad está en niveles moderados para el cultivo.";
      } else {
        mensaje = "Condiciones ideales. La humedad es adecuada para el cultivo.";
      }
  
      const result = {
        "date": date,
        "humidity": humedad.toFixed(2),  // Redondeamos a dos decimales
        "message": mensaje
      };
  
      return  result;
    } catch (error) {
      return {"Error": error};
    }
  }
}

// Fábrica que crea instancias de proveedores
class ProveedorFactory {
  static createProveedor(tipo: string): Proveedor | null {
    switch (tipo) {
      case 'openweathermap':
        return new ProveedorOpenWeatherMap();
      case 'weatherapi':
        return new ProveedorWeatherApi();
      case 'fake':
        return new ProveedorFake();
      default:
        return null;
    }
  }
}

// Define la función de manejo de eventos
export default defineEventHandler(async (event) => {
  // Obtener los parámetros de la solicitud (puedes obtener parámetros como query, headers, etc.)
  const query = getQuery(event);

  // Asegurarse de que 'provider' sea una cadena
  const provider = String(query.provider ?? 'fake');
  
  // Validar que 'date' sea una cadena con formato AAAA-MM-DD
  const date = query.date;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (typeof date !== 'string' || !dateRegex.test(date)) {
    // Maneja el error aquí si la fecha no es válida
    return { error: "Fecha inválida, debe ser en formato AAAA-MM-DD" };

  }
  const lat = query.lat;
  const latRegex = /^-?\d+(\.\d+)?$/; // Validación para número decimal
  if (typeof lat !== 'string' || !latRegex.test(lat)) {
    return { error: "Latitud inválida, debe ser numéros en formato decimal" };
  }

  const lng = query.lng;
  const lngRegex = /^-?\d+(\.\d+)?$/; // Validación para número decimal
  if (typeof lng !== 'string' || !lngRegex.test(lng)) {
    return { error: "Longitud inválida, debe ser numeros en formato decimal" };
  }

  // Usamos la fábrica para crear el proveedor según el tipo
  const proveedor = ProveedorFactory.createProveedor(provider);
   if (proveedor) {
    // Realizamos la consulta con el proveedor seleccionado
    const resultado = await proveedor.realizarConsulta(lat, lng, date);

    // Devolver la respuesta como JSON
    return resultado;
  } else {
    // Si no se encuentra el proveedor, devolvemos un error
    return { error: "Proveedor no encontrado" };
  } 

});