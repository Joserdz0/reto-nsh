<template>
  <v-form v-model="valid">
    <v-container>
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="latitude"
            :rules="latitudeRules"
            label="Latitud"
            required
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field
            v-model="longitude"
            :rules="longitudeRules"
            label="Longitud"
            required
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="4">
          <v-text-field
            v-model="date"
            :rules="dateRules"
            label="Fecha"
            required
            type="date"
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="12">
          <v-select
            v-model="selectedApi"
            :items="apiOptions"
            item-title="label"
            item-value="value"
            label="Proveedor"
            required
          ></v-select>
        </v-col>
        <v-col cols="12" md="12" class="d-flex justify-center">
          <v-btn
            color="primary"
            @click="submit"
            :disabled="!valid"
          >
            Escanear Clima
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-form>
</template>
<script setup lang="ts">
import { ref } from 'vue';


const forecast = useState<any>("forecast", () => []);
const valid = ref(false);
const latitude = ref('');
const longitude = ref('');
const date = ref('');
const selectedApi = ref('');
const apiOptions = ref([
  { label: 'OpenWeatherMap API', value: 'openweathermap' },
  { label: 'WeatherAPI', value: 'weatherapi' },
  { label: 'Fake Weather API', value: 'fake' },
]);

const latitudeRules = [
  (value: string) => {
    if (value && !isNaN(Number(value)) && Number(value) >= -90 && Number(value) <= 90) return true;
    return 'Latitud debe ser un número entre -90 y 90.';
  },
  (value: string) => {
    if (value) return true;
    return 'Latitude es requerida.';
  },
];

const longitudeRules = [
  (value: string) => {
    if (value && !isNaN(Number(value)) && Number(value) >= -180 && Number(value) <= 180) return true;
    return 'Longitud debe ser un número entre -180 y 180.';
  },
  (value: string) => {
    if (value) return true;
    return 'Longitud es requerida.';
  },
];

const dateRules = [
  (value: string) => {
    if (value) return true;
    return 'Date es requerida.';
  },
  (value: string) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (regex.test(value)) return true;
    return 'Date debe tener el formato YYYY-MM-DD.';
  },
];

//funcion para cambiar el estado de loading
const loading = useState('loading', () => false)
const changeLoading = () => {
  loading.value = !loading.value
  useState('loading', () => loading.value)
}

const data = ref<any>(null);
const error = ref(null)
// Función que se ejecuta al presionar el botón
const submit = async () => {
  try {
  changeLoading();
  const response = await $fetch('/api/weather', {
    method: 'GET',
    params: {
      date: date.value,
      lat: latitude.value,
      lng: longitude.value,
      provider: selectedApi.value,
    }
  })

  // Si `response.data` es una promesa, espera a que se resuelva
  const result = await response;
    data.value = result; 
    
    useState('lat', () => latitude.value)
    useState('lng', () => longitude.value)
    useState('date', () => data.value.date)

    useState('humidity', () => data.value.humidity)
    useState('message', () => data.value.message)
    forecast.value.push({
      date: data.value.date.split('-').reverse().join('-'),
      color: data.value.humidity < 30 ? 'red' 
       : data.value.humidity < 60 ? 'yellow' 
       : 'green',
      humidity: data.value.humidity,
      message: data.value.message
      })
    useState('forecast', () => forecast.value)

  } catch (err) {
    error.value = err; // Guarda el error en caso de que falle la solicitud
  }
  changeLoading();

}
</script>
