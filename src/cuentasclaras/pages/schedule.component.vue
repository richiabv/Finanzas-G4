<template>
  <div class="mis-cronogramas-wrapper">
    <ToolBarComponent />
    <div class="content">
      <h2 class="titulo">Mis cronogramas guardados</h2>
      <div v-if="loading" class="mensaje">Cargando...</div>
      <div v-else-if="cronogramas.length === 0" class="mensaje">No se encontraron cronogramas.</div>
      <div v-else class="lista">
        <div class="card" v-for="item in cronogramasOrdenados" :key="item.id">
          <h3>{{ item.nombre }}</h3>
          <p><strong>Fecha:</strong> {{ formatFecha(item.fechaGuardado) }}</p>
          <p><strong>Duración:</strong> {{ item.resultados?.duracion || '---' }}</p>
          <p><strong>TCEA Emisor:</strong> {{ item.resultados?.tceaEmisor || '---' }}</p>
          <button @click="verDetalle(item)">Ver detalle</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref, computed } from 'vue';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '@/firebase';
import ToolBarComponent from '@/public/tool-bar-component.vue';
import { format } from 'date-fns';
import { useRouter } from 'vue-router';

export default {
  name: 'MisCronogramas',
  components: { ToolBarComponent },
  setup() {
    const cronogramas = ref([]);
    const loading = ref(true);
    const router = useRouter();

    const cargarCronogramas = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

        const q = query(collection(db, 'cronogramas'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        cronogramas.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error('Error al cargar cronogramas:', error);
      } finally {
        loading.value = false;
      }
    };

    const cronogramasOrdenados = computed(() => {
      return [...cronogramas.value].sort((a, b) => {
        const fechaA = a.fechaGuardado?.toDate?.() || new Date(0);
        const fechaB = b.fechaGuardado?.toDate?.() || new Date(0);
        return fechaB - fechaA;
      });
    });

    const formatFecha = timestamp => {
      if (!timestamp?.toDate) return '---';
      return format(timestamp.toDate(), 'dd/MM/yyyy HH:mm');
    };

    const verDetalle = item => {
      router.push({
        name: 'payment-schedule',
        query: { cargaId: item.id }
      });
    };

    onMounted(cargarCronogramas);

    return {
      cronogramas,
      loading,
      formatFecha,
      verDetalle,
      cronogramasOrdenados
    };
  }
};
</script>

<style scoped>
.mis-cronogramas-wrapper {
  font-family: 'Inter', sans-serif;
}
.content {
  max-width: 900px;
  margin: auto;
  padding: 2rem;
}
.titulo {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 1rem;
}
.lista {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.card {
  flex: 1 1 250px;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 1px 1px 5px rgba(0,0,0,0.1);
  background: #fff;
}
.card h3 {
  margin-top: 0;
}
.card button {
  margin-top: 0.5rem;
  background-color: #25617E;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
.mensaje {
  text-align: center;
  margin-top: 2rem;
  color: #666;
}
</style>
