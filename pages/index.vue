<template>
  <v-container class="back-app" fluid>
    <v-row >
      <v-col cols="12 d-flex justify-center my-5" >
        <v-card :loading="loading">
            <v-expand-transition>
              <div v-if="message && humidity">
                <v-card-item :title="`Información Crítica para la Resistencia (${forecast[forecast.length - 1].date})`">
                  <template v-slot:subtitle>
                    <v-icon
                      class="me-1 pb-1"
                      :color="forecast[forecast.length - 1].color"

                      icon="mdi-alert"
                      size="18"
                    ></v-icon>
                      {{ forecast[forecast.length - 1].message }}
                  </template>
                </v-card-item>
                <div class="d-flex py-3 justify-space-between">

                  <v-list-item
                    density="compact"
                    prepend-icon="mdi-weather-pouring"
                  >

                
                  <v-list-item-subtitle>HUMEDAD: {{ humidity }}%</v-list-item-subtitle>
                </v-list-item>
               </div>


                <v-list class="bg-transparent">
                  <v-list-item
                    v-for="(item, index) in forecast.reverse()"
                    :key="index"
                    append-icon="mdi-alert"
                    :color="item.color"
                    :title="item.date"
                    :subtitle="item.humidity + '%'"
                    :style="`color: ${item.color}`"
                  >
                  </v-list-item>
                </v-list>
              </div>
            </v-expand-transition>

          <v-card-actions>
            <ClimaData>
            </ClimaData>  
         </v-card-actions>
        </v-card>
      
      </v-col> 
    </v-row>
  </v-container>

</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
const forecast = useState("forecast") ?? [];

const loading = useState("loading");
const lat = useState("lat");
const lng = useState("lng");
const date = useState("date");
const humidity = useState("humidity");
const message = useState("message");
const humidityColor = computed(() => {
  return humidity.value < 30 ? 'red' 
       : humidity.value < 60 ? 'yellow' 
       : 'green';
});
</script>

<style scoped>
</style>