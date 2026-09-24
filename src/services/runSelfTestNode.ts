import { runGarosApiSelfTest } from './apiSelfTest';

async function main() {
  console.log('⚡ Executando Bateria de Testes embutida do GAROS Control Web...\n');
  const report = await runGarosApiSelfTest();
  console.log('\n📊 Relatório Final da Suíte:');
  console.log(`- Status: ${report.passed ? '✅ PASSOU (100% OK)' : '❌ FALHOU'}`);
  console.log(`- Total de Testes: ${report.total}`);
  console.log(`- Sucessos: ${report.passedCount}`);
  console.log(`- Falhas: ${report.failedCount}\n`);

  report.results.forEach((r, idx) => {
    const icon = r.passed ? '✅' : '❌';
    console.log(`${idx + 1}. ${icon} [${r.category}] ${r.name} (${r.durationMs}ms) - ${r.message}`);
  });

  if (!report.passed) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error in test runner:', err);
  process.exit(1);
});
