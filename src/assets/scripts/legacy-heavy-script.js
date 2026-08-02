// Script que trava a thread principal.
//Deve ser resolvido sem modificar esse script
const start = performance.now();
while (performance.now() - start < 10000) {
  Math.sqrt(Math.random());
}
