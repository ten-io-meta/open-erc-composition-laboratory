# OECL — referencia cuantitativa de autonomía del científico

Fecha: 23 noviembre 2026. PR #29, rama de investigación en borrador.  
Cohorte: **todas las 35 parejas** de los 10 perfiles Solidity fijados que no disponían de un experimento de regresión AST dedicado. La selección se calcula automáticamente: combinaciones no ordenadas menos las 10 parejas ya configuradas; tres fragmentos de 12, 12 y 11, sin escoger parejas por sus resultados.

## Qué se midió

El instrumento `scripts/check-blind-scientist-autonomy-baseline.cjs` **no formula predicciones esperadas a partir del nombre del ERC**. Recupera las fuentes, hipótesis y análisis de rutas generados por el trabajador AST, comprueba los SHA-256, identifica los patrones emitidos y redacta preguntas o controles tentativos con reglas genéricas. Un control separado impide contar como ejecutado o confirmado cualquier resultado sin evidencia EVM.

**Resultados observados** — [ejecución GitHub #45252825880](https://github.com/ten-io-meta/open-erc-composition-laboratory/actions/runs/45252825880):

| Medición | Resultado |
| --- | ---: |
| Parejas con análisis AST completado | 35/35 |
| Parejas con al menos un patrón reconocido | 10/35 |
| Parejas sin patrones de las familias disponibles | 25/35 |
| Patrones de herencia compartida | 7 |
| Patrones de disminución de estado | 6 |
| Total de hipótesis estructurales emitidas | 13 |
| Preguntas de falsación diseñadas automáticamente con reglas existentes | 13 |
| Adaptadores EVM generados de forma autónoma | 0 |
| Experimentos EVM realizados en esta evaluación | 0 |
| Teorías confirmadas independientemente en esta evaluación | 0 |

Los tres fragmentos pasaron sus pruebas científicas de límites y procedencia. Los artefactos del workflow recogen por pareja los SHA-256 originales, hipótesis estructurales, alternativas, preguntas, posibles controles, incertidumbres y la ausencia declarada de adaptador EVM.

## Interpretación — sin inflar capacidades

- **Sí demuestra** que un analizador de fuentes compiladas propone ciertos patrones para una cohorte no seleccionada por su resultado y que el sistema genera preguntas vinculadas a las evidencias sin atribuir compatibilidad.
- **No demuestra** razonamiento científico abierto, comprensión semántica de cualquier ERC, generación de bytecode de prueba, autonomía en la selección de herramientas o descubrimientos confirmados.
- Los 25 pares sin patrones permanecen `INCONCLUSIVE`; no se han declarado incompatibles.
- La cohorte no es un ensayo ciego respecto al desarrollo histórico del código: son las fuentes ya registradas y las reglas existentes, pero sí evita seleccionar manualmente las parejas ganadoras dentro de ese subconjunto.
- Los resultados son **solo fuentes AST**. No deben sumarse a los experimentos EVM existentes sobre otras parejas ni a los 626 documentos ERC.

## Próximo cambio requerido para acercarnos al científico original

Construir un **planificador de falsación condicionado por capacidad**, capaz de convertir una hipótesis en un protocolo experimental tipado cuando exista un modelo de estado y un adaptador adecuado, o declarar explícitamente que no puede ejecutarlo. Ese planificador debería separar:

1. Precondiciones observables, participantes, misma unidad y fuente identificada.
2. Predicción numérica o lógica falsable y alternativa explicativa.
3. Controles positivos y negativos elegidos por el mecanismo, no únicamente por la existencia de una función.
4. Alcance de ejecución, aislamiento, presupuestos y consentimiento de seguridad.
5. Recibos o prueba formal que permitan revisión independiente, sin modificar los datos.
6. Conclusión `CONFIRMED_SCOPED`, `REFUTED_SCOPED` o `UNRESOLVED` **solo tras recibir evidencia del nivel exigido**.

La próxima evaluación debe incorporar un conjunto realmente nuevo y fijado después de definir los criterios, preferentemente de diferentes familias técnicas, y contabilizar las investigaciones terminadas sin intervención humana. Hasta entonces, la denominación correcta es **generación estructural de hipótesis por reglas**, no científico autónomo general.

No se autoriza ningún despliegue, fusión, compilación pública de contratos arbitrarios o afirmación de seguridad universal.
