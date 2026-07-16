# Integración vía API REST

InvoiCy ofrece a sus clientes la posibilidad de integrarse mediante una API REST, permitiendo realizar la emisión de Documentos Tributarios Electrónicos (DTE) de forma segura y eficiente, así como la consulta de documentos.

Para facilitar el proceso, el servicio cuenta con dos entornos diferenciados: uno de Pruebas, destinado exclusivamente a la validación y simulación de procesos antes de la puesta en marcha, y otro de Producción, donde las operaciones son definitivas y los documentos generados poseen validez fiscal y legal.

En la documentación disponible se encuentran detallados los servicios y las direcciones URL correspondientes a cada entorno.

## API Emisión

- **Finalidad:** Enviar Facturas Electrónicas (FE) para procesamiento por InvoiCy.
- **Endpoints:**
- Pruebas URL: 
- Producción URL: 

## API Documentos

- **Finalidad:** Consultar Facturas Electrónicas emitidas.
- **Endpoints:**
- Pruebas URL: 
- Producción URL: 

Antes de poder consumir los servicios de la API REST de InvoiCy, es necesario autenticarse. La autenticación garantiza que solo los usuarios autorizados puedan utilizar los servicios disponibles.

Para más detalles sobre cómo realizar la autenticación y obtener los tokens de acceso necesarios, consulte la documentación completa de [Autenticación API Rest](https://migrate-company.github.io/PortalInvoiCyChile/Integracion/AutenticacionAPIRest/){target="_blank"}.