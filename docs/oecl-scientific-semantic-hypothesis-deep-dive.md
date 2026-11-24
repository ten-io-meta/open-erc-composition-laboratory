# OECL — hipótesis científicas con alcance, falsadores y límites

**Fecha:** 23 de noviembre de 2026  
**Estado:** investigación de fuente oficial fijada, sin despliegue ni adjudicación de compatibilidad.  
**Corpus:** [ethereum/ERCs, revisión e9c1adc6](https://github.com/ethereum/ERCs/tree/e9c1adc6ad36faec8a6bc509cc8a14ec9b8f741d).  
**Resultados máquina:** `all-erc-scientific-falsification-agenda.json`, `deep-erc-scientific-hypotheses.json` y, cuando la CI específica lo confirme, `erc7837-erc8098-conditional-invariant-tension.json`.

## Qué se ha ampliado

Los 626 documentos oficiales del corpus tienen 1.189 preguntas documentales. De las **54** antes difíciles de extraer, **13** reciben ahora un diseño científico individual: alcance, precondiciones, control positivo, adversarial, criterio de refutación, modalidad de ensayo y evidencias independientes. Las **41** restantes conservan línea y contexto verificables, pero no se afirma que tengan una proposición semánticamente validada.

Cada línea citada lleva SHA-256 contra la revisión fijada. Se rechazan fuentes alteradas, IDs de hipótesis duplicados, citas ausentes y elevaciones a `COMPATIBLE`, `ESTABLISHED` o `EVM_EXECUTED` sin test.

## Prioridad de investigación de las 13 hipótesis

| ERC | Pregunta condicionada que OECL puede investigar | Control adversarial / técnica | Límite actual |
| --- | --- | --- | --- |
| 55 | ¿El checksum reproduce el mapeo de mayúsculas por Keccak-256? | Modificar nibbles alfabéticos en vectores; oráculo Keccak independiente | No afirma rechazo de toda mutación por todos los clientes |
| 191 | ¿La versión 0x00 liga correctamente la firma al validador previsto? | Reutilizar la misma firma con otro validador y preimagen | No implica protección universal frente a replay |
| 2535 | ¿Los cambios de facetas tienen traza de evento y despacho coherente? | Cortes no autorizados según la política de la implementación, colisiones y efectos de almacenamiento | No se presume un modelo universal de administrador |
| 7201 | ¿Coinciden fórmula, anotación y raíz de almacenamiento? | Alterar fórmula/namespace y comparar implementaciones independientes | Dos IDs no tienen una garantía matemática absoluta de no colisión |
| 600 | ¿Se respeta la derivación endurecida m/43'/60'/EIP'? | Alterar derivación y contrastar dos bibliotecas BIP32 fijadas | Requiere el estándar externo BIP32 y no debe usar claves reales |
| 1328 | ¿Los URI distinguen parámetros obligatorios de versiones 1 y 2? | Ausencia de parámetros, versión incorrecta y escape URI | Sintaxis correcta no demuestra emparejamiento seguro |
| 1387 | ¿La verificación distingue prueba Merkle y firma válidas de falsificadas? | Alterar ruta, firma, destinatario y emisor | La interfaz histórica no define por sí sola el sistema completo |
| 1388 | ¿Se aplican los permisos del gestor de emisores? | Mutación de lista sin autorización, capacidades incorrectas | Hace falta implementación y política de permisos concretas |
| 2678 | ¿El manifiesto EthPM v3 respeta estructura y digests? | Campos inválidos, dependencias cambiadas, hashes rotos | JSON bien formado no implica confianza en la cadena de suministro |
| 7743 | ¿Una transferencia añade propietario sin retirar el anterior? | Cuotas insuficientes, propietarios duplicados y archivados | No se extrapola compatibilidad ERC-721 |
| 7837 | ¿Una transferencia positiva acuña unidades sin descontar al emisor y respeta maxSupply? | Cap, tarifa nativa insuficiente, cantidad cero | Es un modelo de suministro distinto al ERC-20 conservativo |
| 897 | ¿La introspección del proxy coincide con su implementación real? | Proxy que informa un destino distinto del delegado real | ABI de introspección no equivale a seguridad de proxy |
| 1822 | ¿El proxy rechaza lógica con UUID incompatible y conserva almacenamiento? | Upgrade no autorizado, UUID incorrecto, slot y rutas peligrosas | Los resultados se restringen a implementación fijada |

Todas estas hipótesis tienen `PROPOSED_NOT_INDEPENDENTLY_TESTED`, `NOT_EVALUATED` y revisión humana pendiente. Los criterios descritos son diseños de ensayo, **no resultados observados**.

## Hipótesis emergente entre estándares: ERC-7837 × ERC-8098

La [especificación oficial fijada de ERC-7837](https://github.com/ethereum/ERCs/blob/e9c1adc6ad36faec8a6bc509cc8a14ec9b8f741d/ERCS/erc-7837.md) describe una transferencia positiva donde el receptor recibe unidades nuevas y el suministro crece por la cantidad transferida, sin superar `maxSupply`. La [implementación candidata fijada de ERC-8098](https://github.com/ten-io-meta/erc8098-reference/blob/68a05289bd68d89db8453c49500e0a1ae6cd11ec/contracts/ERC8098Reference.sol) utiliza acuñación de constructor sin función pública de acuñación posterior.

**Modelo condicional**, sin atribuirlo a cualquier bytecode: si el **mismo** suministro S en la **misma** operación exitosa con cantidad q > 0 debe cumplir simultáneamente:

- Modelo difusivo: `S_después = S_antes + q > S_antes`.
- Modelo no creciente: `S_después <= S_antes`.

Las dos condiciones son incompatibles **bajo esas premisas**. Las premisas dejan de coincidir si los contratos tienen suministros separados, la transferencia revierte por límite, q = 0 o la semántica se adapta. Se necesitan implementaciones concretas y recibos autenticados antes de declarar cualquier incompatibilidad ejecutable.

### Por qué este caso importa

Aquí el científico sí puede identificar una tensión formal **antes** de ejecutar una EVM, pero no puede reescribir una ejecución. Su tarea es diseñar una prueba que determine si las premisas realmente describen el mismo contrato y operación. `NOT_EVALUATED` permanece hasta que exista evidencia adicional.

## Puertas de seguridad y ciencia

1. Aprobar semánticamente cada hipótesis leyendo el apartado completo, no solo su cita.
2. Fijar las implementaciones, compilador, dependencias y modelo de permisos.
3. Registrar controles positivos, adversariales y resultados esperados **antes** de ejecutar.
4. Verificar por separado las mediciones y recibos EVM, cuando EVM sea pertinente; criptografía y formatos fuera de cadena requieren oráculos independientes adecuados.
5. Emitir un resultado limitado al escenario probado, junto con refutaciones, incertidumbres y efectos entre estándares.

**No se ha identificado ninguna vulnerabilidad explotable mediante estos diseños; tampoco se declara que todos los ERC tengan implementación Solidity ejecutable.**


## Resultados ejecutados posteriormente: ERC-7201 y ERC-2535 × ERC-7201

### ERC-7201: comparación de dos oráculos y sonda EVM local

La revisión oficial `e9c1adc6...` fija la expresión de raíz de almacenamiento. OECL calcula cinco raíces con **ethers v5 (Keccak + ABI)** y **ethereum-cryptography (Keccak + empaquetado explícito de uint256)**. Los dos oráculos coinciden para esos identificadores y rechazan tres fórmulas deliberadamente erróneas: sin resta de uno, sin Keccak externo y sustituyendo Keccak por SHA3-256. Una sonda Solidity propia compilada con `solc 0.8.26` devuelve las cinco mismas raíces y emite eventos mediante cinco transacciones minadas en Hardhat 31337. Un segundo trabajo de CI contrasta los artefactos sin reutilizar el oráculo criptográfico de ejecución.

**Limitación:** comprobación real de la fórmula de ERC-7201 para cinco entradas. No valida anotaciones de ningún contrato productivo, ausencia universal de colisiones o certificados de mainnet.

### ERC-2535: Diamond de referencia oficial y facetas de laboratorio

OECL compila `assets/erc-2535/reference/Diamond.sol` de la misma revisión oficial fijada, despliega su `Diamond`, `DiamondCutFacet` y `DiamondLoupeFacet`, y añade dos facetas sintéticas que acceden al mismo slot calculado mediante ERC-7201. El experimento examina la incorporación, sustitución y retirada de selectores; verifica eventos `DiamondCut`, despacho de la función al facet esperado, rechazo de un cambio por un no propietario y rechazo de un selector duplicado. La escritura mediante `delegatecall` modifica el almacenamiento del Diamond, no el de la faceta. El valor permanece al cambiar de faceta y se modifica conforme a la lógica de la versión nueva.

**Limitación:** demuestra esos caminos concretos en EVM local, no que todo Diamond preserve invariantes ni que ERC-2535 y ERC-7201 sean universalmente compatibles. La implementación Diamond está fijada; las dos facetas experimentales son propias y no tienen por qué representar aplicaciones reales. Los tres rechazos en `callStatic` no generan recibos minados.

Los informes declaran `NOT_EVALUATED` para compatibilidad global, `NOT_ADMITTED` para admisión y separan verificación contra proveedor Hardhat de autenticación de consenso Ethereum. No se ha identificado ningún exploit con estas comprobaciones de laboratorio.
