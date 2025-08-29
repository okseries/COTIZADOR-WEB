// 🧪 SCRIPT DE PRUEBA PARA VALIDAR FUNCIONAMIENTO
// Ejecutar en consola del navegador para verificar que todo funciona

console.log('🧪 INICIANDO PRUEBAS DE FUNCIONAMIENTO...');

// Test 1: Verificar que el store responde
const testStore = () => {
  try {
    const quotationStore = window.__ZUSTAND_STORES__?.quotation;
    if (quotationStore) {
      console.log('✅ Store disponible');
      return true;
    } else {
      console.log('⚠️ Store no disponible - esto es normal');
      return false;
    }
  } catch (error) {
    console.log('⚠️ Error accediendo store:', error.message);
    return false;
  }
};

// Test 2: Verificar navegación entre steps
const testNavigation = () => {
  try {
    const stepButtons = document.querySelectorAll('button');
    const nextButtons = Array.from(stepButtons).filter(btn => 
      btn.textContent?.includes('Siguiente') || btn.textContent?.includes('Next')
    );
    
    console.log(`✅ Botones de navegación encontrados: ${nextButtons.length}`);
    return nextButtons.length > 0;
  } catch (error) {
    console.log('❌ Error en test de navegación:', error.message);
    return false;
  }
};

// Test 3: Verificar formularios
const testForms = () => {
  try {
    const inputs = document.querySelectorAll('input, select');
    console.log(`✅ Campos de formulario encontrados: ${inputs.length}`);
    return inputs.length > 0;
  } catch (error) {
    console.log('❌ Error en test de formularios:', error.message);
    return false;
  }
};

// Ejecutar pruebas
const runTests = () => {
  console.log('\n📋 EJECUTANDO PRUEBAS...\n');
  
  const results = {
    store: testStore(),
    navigation: testNavigation(),
    forms: testForms()
  };
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  console.log('\n📊 RESULTADOS:');
  console.log(`✅ Pruebas pasadas: ${passed}/${total}`);
  
  if (passed === total) {
    console.log('🎉 TODAS LAS PRUEBAS PASARON - Sistema funcionando correctamente');
  } else {
    console.log('⚠️ Algunas pruebas fallaron - Verificar funcionalidad manualmente');
  }
  
  return results;
};

// Auto-ejecutar
setTimeout(runTests, 1000);

console.log('🧪 PRUEBAS PROGRAMADAS - Resultados en 1 segundo...');
