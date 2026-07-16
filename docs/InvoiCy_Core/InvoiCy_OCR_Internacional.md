# InvoiCy OCR Internacional

InvoiCy OCR Internacional es una solución de inteligencia artificial desarrollada para empresas que necesitan procesar, traducir y extraer datos estructurados de facturas y documentos fiscales emitidos en cualquier país o idioma.

Al recibir un archivo (PDF o imagen) que contiene una factura internacional, el producto aplica tecnología OCR combinada con modelos avanzados de lenguaje para interpretar el contenido del documento y devolver un JSON estructurado con todos los datos principales de la factura, independientemente del idioma original, del formato visual o del país de origen.

El resultado es la eliminación del trabajo manual asociado a la validación y carga de datos de importación, acelerando el proceso de registro y conciliación de documentos internacionales en los sistemas de gestión del cliente.

## Casos de Uso

InvoiCy OCR Internacional está especialmente indicado para empresas que:

- **Importan productos o servicios** y reciben facturas en idiomas extranjeros (japonés, árabe, alemán, mandarín, entre otros) que necesitan ser registradas en sistemas locales.
- **Operan en múltiples países** y requieren estandarizar el formato de facturas provenientes de distintos orígenes en un único esquema de datos.
- **Automatizan procesos de cuentas por pagar** y necesitan eliminar la carga manual de datos de las facturas recibidas.
- **Realizan auditorías fiscales** y requieren trazabilidad y extracción confiable de información de documentos internacionales.

**Ejemplo práctico:** Una empresa en Uruguay recibe regularmente facturas de proveedores japoneses, redactadas en idioma japonés. Con InvoiCy OCR Internacional, puede enviar el archivo de la factura a través de la API y recibir como respuesta un JSON estructurado con todos los datos relevantes —número de factura, importe, ítems, fechas, datos del emisor y del destinatario— traducidos y organizados, listos para ser importados en su sistema de gestión.

## Cómo Funciona

El flujo de procesamiento de InvoiCy OCR Internacional sigue cuatro etapas principales:

**1. Registro de la empresa** 
Antes de enviar documentos para su procesamiento, es necesario registrar la empresa importadora en la plataforma InvoiCy OCR. Este registro devuelve un identificador único (`EmpAK`), que será utilizado en todas las solicitudes posteriores.

**2. Envío del documento** 
Una vez registrada la empresa, el cliente envía el archivo de la factura (en formato Base64) al endpoint de importación de documentos. Es posible seleccionar el procesador de inteligencia artificial más adecuado según el tipo de documento.

**3. Procesamiento asíncrono** 
La API procesa el documento en segundo plano, aplicando tecnología OCR y modelos de lenguaje para interpretar, traducir y estructurar la información contenida en la factura. La respuesta inmediata al envío es un número de `protocolo` para el seguimiento del procesamiento.

**4. Consulta del resultado** 
Utilizando el `protocolo` recibido, el cliente puede consultar la API para obtener el JSON estructurado con todos los datos extraídos del documento.

## Requisitos Previos

<div class="typeset-emphasis">
<b class="emphasis__title">Importante: Requisito Comercial</b><br>
InvoiCy OCR Internacional es un producto de acceso controlado. <b>Para utilizar la solución, es obligatorio que el modelo comercial y la negociación hayan sido previamente formalizados con el equipo de Migrate.</b> Una vez contratada la solución, el equipo comercial proporcionará las credenciales y las claves de autenticación necesarias para acceder a la API. Para iniciar una negociación, póngase en contacto con el equipo comercial de Migrate.
</div>

**Requisitos técnicos**

- Credenciales de acceso proporcionadas después de la formalización de la negociación comercial.
- Capacidad para realizar llamadas HTTP REST desde su aplicación.
- Capacidad para convertir archivos (PDF o imágenes) al formato Base64.
- La integración técnica es **responsabilidad del cliente**, quien se conectará directamente con la API del producto.

## Ambientes Disponibles

El producto dispone de dos entornos de integración diferenciados. Se recomienda utilizar ampliamente el entorno de homologación para realizar pruebas y validaciones antes de habilitar las operaciones en producción.

### Homologación 
Entorno destinado a pruebas y validaciones técnicas. Las solicitudes realizadas en este endpoint no afectan datos reales ni oficiales.

- **URL Base:** `https://apibrhomolog.invoicy.com.br/ocrdocuments/api/v1/`

### Producción 
Entorno oficial para operaciones reales. Este endpoint debe utilizarse únicamente después de la finalización y validación de todas las pruebas en el entorno anterior.

- **URL Base:** `https://apibr.invoicy.com.br/ocrdocuments/api/v1/`

La URL base (`BASE_URL`) debe ser sustituida por la URL correspondiente al entorno deseado.
Por ejemplo:

```
https://apibr.invoicy.com.br/ocrdocuments/api/v1/Company
```

## Autenticación

Todas las solicitudes a la API de InvoiCy OCR Internacional utilizan un mecanismo de autenticación basado en **hash MD5**, enviado a través del header.

### Generación del hash en el registro de empresa

Para el registro de empresa, el hash MD5 se genera a partir de la concatenación de la **clave del socio** con el **JSON del cuerpo de la solicitud**:

```
MD5(clave_del_socio + json_del_cuerpo)
```

### Generación del hash en las demás solicitudes

Para las solicitudes de importación y consulta de documentos, el hash MD5 se genera a partir de la concatenación del **EmpAK** (retornado en el registro de empresa) con un **timestamp Unix en UTC**:

```
MD5(empAK + timestamp_unix_utc)
```

Ejemplo de cadena antes de la generación: `x99Xxxxxx+XX9/xxXXxX9xXXXXXx+9xx1740080360`

**Importante**: El hash MD5 tiene una validez de **5 minutos** a partir de su generación. Las solicitudes enviadas con un hash expirado serán rechazadas con el código de error `403 Forbidden`.

### Headers obligatorios

Todas las solicitudes deben incluir los siguientes encabezados:

```
X-Client-MD5-Hash: [MD5 generado]
Content-Type: application/json; api-version=1.0
```

## Guía de Integración

Esta sección describe el paso a paso para integrar con InvoiCy OCR Internacional.

### Paso 1 — Consulta de Países (opcional)

Antes de registrar una empresa, puede ser necesario obtener el `countryId` correspondiente al país de operación. Utilice el endpoint de consulta de países pasando el nombre del país.

Ejemplo: `GET BASE_URL/Country?Nome=Uruguai`

El campo `id` devuelto en la respuesta debe utilizarse en el campo `countryId` del registro de la empresa.

### Paso 2 — Registro de la Empresa

Realice el registro de la empresa en la plataforma InvoiCy OCR. Este paso se realiza **una única vez** por empresa.

- Genere el hash MD5 según lo descrito en la sección de autenticación.
- Envíe la solicitud `POST` a `BASE_URL/Company` con el JSON de registro.
- Almacene de forma segura el `EmpAK` devuelto. Este será utilizado en todas las solicitudes futuras.

Ejemplo de estructura JSON para el registro de la empresa:
```json
{
  "name": "Nombre de la Empresa S.A.",
  "cnpj": "00.000.000/0001-00",
  "partnerId": "{{partnerId}}",
  "email": "contacto@empresa.com.br",
  "phone": "(11) 3333-4444",
  "address": {
    "street": "Calle Ejemplo",
    "number": "100",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01310-100",
    "countryId": "{{countryId}}"
  }
}
```

### Paso 3 — Importación del Documento

Con la empresa registrada, envíe el archivo de la factura para su procesamiento.

- Convierta el archivo (PDF o imagen) a Base64.
- Genere el hash MD5 utilizando el `EmpAK` y el timestamp Unix actual.
- Envíe la solicitud `POST` a `BASE_URL/DocumentHandler/AddDocument`.
- Almacene el `protocolo` devuelto en la respuesta.

**Importante:** La fecha y hora devueltas en la respuesta se proporcionan en formato **UTC**.

Ejemplo de estructura JSON para el envío del documento:
```json
{
  "companyId": 1,
  "fileBase64": "Base64_Document",
  "mimeType": "application/pdf",
  "processor": 8,
  "targetLanguage": "pt-BR"
}
```

### Paso 4 — Consulta del Resultado

Utilice el `protocolo` obtenido en el paso anterior para consultar el resultado del procesamiento.

- Envíe la solicitud `GET` a `BASE_URL/DocumentHandler/SearchDocument?companyId={id}&protocol={protocolo}`.
- La respuesta será un JSON estructurado con todos los datos extraídos de la factura.

## Referencia de Endpoints

Para ejemplos interactivos, payloads completos y pruebas, acceda a la [documentación completa en Postman](https://documenter.getpostman.com/view/12809904/2sBXqDs3Di).

### [Consulta de Países](https://documenter.getpostman.com/view/12809904/2sBXqDs3Di#c1284595-cb0b-4dd4-9f56-93672772c581)

Devuelve el identificador (`id`) de un país por su nombre. El valor devuelto se utiliza en el campo `countryId` durante el registro de la empresa. El nombre del país debe informarse como parámetro al final de la URL.

```
GET BASE_URL/Country?Nome={nome_do_pais}
```

### [Registro de Empresa](https://documenter.getpostman.com/view/12809904/2sBXqDs3Di#839f2888-8620-4dc9-af75-edb3799b88d3)

Registra una empresa en la plataforma InvoiCy OCR, habilitándola para procesar documentos. La respuesta contiene el `EmpAK`, que debe ser almacenado de forma segura por el cliente y utilizado en todas las solicitudes posteriores.

```
POST BASE_URL/Company
```

---

### [Importación de Documento](https://documenter.getpostman.com/view/12809904/2sBXqDs3Di#1570e89e-e35b-4179-ad98-c16c93bfe434)

Recibe el archivo de la factura en formato Base64 e inicia el procesamiento mediante OCR e IA. La respuesta contiene un `protocolo` para el seguimiento del procesamiento asíncrono.

```
POST BASE_URL/DocumentHandler/AddDocument
```

**Campos del cuerpo de la solicitud:**

<table border="1">
    <thead>
        <tr>
            <th width="250">Campo</th>
            <th width="250">Tipo</th>
            <th width="600">Descripción</th>
        </tr>
    </thead>
    <tbody height="20">
        <tr>
            <td><code>companyid</code></td>
            <td>string</td>
            <td>ID de la empresa devuelto en el registro.</td>
        </tr>
        <tr>
            <td><code>fileBase64</code></td>
            <td>string</td>
            <td>Contenido del archivo en Base64 (PDF o imagen).</td>
        </tr>
        <tr>
            <td><code>mimeType</code></td>
            <td>string</td>
            <td>Tipo MIME del archivo enviado. Ver <a href="#formatos-de-archivo-soportados">formatos soportados</a>.</td>
        </tr>
        <tr>
            <td><code>processor</code></td>
            <td>integer</td>
            <td>Identificador del procesador de IA. Ver <a href="#procesadores-disponibles">procesadores disponibles</a>.</td>
        </tr>
    </tbody>
</table>

### [Consulta de Documento](https://documenter.getpostman.com/view/12809904/2sBXqDs3Di#edd726f3-858e-4d28-88c5-cf86e20c3450)

Consulta el resultado del procesamiento de un documento previamente importado. Devuelve el JSON estructurado con todos los datos extraídos de la factura.

```
GET BASE_URL/DocumentHandler/SearchDocument?companyId={id}&protocol={protocolo}
```

**Parámetros de consulta:**

<table border="1">
    <thead>
        <tr>
            <th width="250">Parámetro</th>
            <th width="600">Descripción</th>
        </tr>
    </thead>
    <tbody height="20">
        <tr>
            <td><code>companyId</code></td>
            <td>ID de la empresa devuelto en el registro.</td>
        </tr>
        <tr>
            <td><code>protocol</code></td>
            <td>Protocolo devuelto en el momento de la importación del documento.</td>
        </tr>
    </tbody>
</table>

## Estructura de Retorno: Detalle de los Campos

El JSON de respuesta de la consulta de documento contiene los siguientes campos:

### Datos del Emisor

<table border="1">
    <thead>
        <tr>
            <th width="50">ID</th>
            <th width="250">Campo</th>
            <th width="400">Descripción</th>
            <th width="100">Tipo</th>
            <th width="150">Tam. Máx.</th>
        </tr>
    </thead>
    <tbody height="20">
        <tr>
            <td>A01</td>
            <td><code>documentType</code></td>
            <td>Tipo de documento.</td>
            <td>int</td>
            <td>—</td>
        </tr>
        <tr>
            <td>A02</td>
            <td><code>issuerDocument</code></td>
            <td>Número del documento fiscal del emisor.</td>
            <td>string</td>
            <td>50</td>
        </tr>
        <tr>
            <td>A03</td>
            <td><code>nameFantasy</code></td>
            <td>Nombre comercial de la empresa emisora.</td>
            <td>string</td>
            <td>100</td>
        </tr>
        <tr>
            <td>A04</td>
            <td><code>corporateName</code></td>
            <td>Razón social de la empresa emisora.</td>
            <td>string</td>
            <td>150</td>
        </tr>
        <tr>
            <td>A05</td>
            <td><code>address</code></td>
            <td>Dirección de la empresa emisora.</td>
            <td>string</td>
            <td>200</td>
        </tr>
        <tr>
            <td>A06</td>
            <td><code>postalCode</code></td>
            <td>Código postal de la dirección del emisor.</td>
            <td>string</td>
            <td>20</td>
        </tr>
        <tr>
            <td>A07</td>
            <td><code>city</code></td>
            <td>Ciudad de la empresa emisora.</td>
            <td>string</td>
            <td>100</td>
        </tr>
        <tr>
            <td>A08</td>
            <td><code>state</code></td>
            <td>Estado/Provincia de la empresa emisora.</td>
            <td>string</td>
            <td>50</td>
        </tr>
        <tr>
            <td>A09</td>
            <td><code>country</code></td>
            <td>País de la empresa emisora.</td>
            <td>string</td>
            <td>50</td>
        </tr>
        <tr>
            <td>A36</td>
            <td><code>taxID</code></td>
            <td>Identificación fiscal del emisor (ej: RUT, CNPJ, CPF).</td>
            <td>string</td>
            <td>50</td>
        </tr>
    </tbody>
</table>

### Datos de la Factura

<table border="1">
    <thead>
        <tr>
            <th width="50">ID</th>
            <th width="250">Campo</th>
            <th width="400">Descripción</th>
            <th width="100">Tipo</th>
            <th width="150">Tam. Máx.</th>
        </tr>
    </thead>
    <tbody height="20">
        <tr>
            <td>A10</td>
            <td><code>invoiceNumber</code></td>
            <td>Número de la factura.</td>
            <td>string</td>
            <td>50</td>
        </tr>
        <tr>
            <td>A11</td>
            <td><code>invoiceSeries</code></td>
            <td>Serie de la factura.</td>
            <td>string</td>
            <td>20</td>
        </tr>
        <tr>
            <td>A12</td>
            <td><code>purchaseOrder</code></td>
            <td>Número de la orden de compra (OC).</td>
            <td>string</td>
            <td>—</td>
        </tr>
        <tr>
            <td>A13</td>
            <td><code>documentLetter</code></td>
            <td>Letra del documento.</td>
            <td>string</td>
            <td>—</td>
        </tr>
        <tr>
            <td>A14</td>
            <td><code>issueDate</code></td>
            <td>Fecha de emisión de la factura.</td>
            <td>DateTime</td>
            <td>—</td>
        </tr>
        <tr>
            <td>A15</td>
            <td><code>dueDate</code></td>
            <td>Fecha de vencimiento de la factura.</td>
            <td>DateTime</td>
            <td>—</td>
        </tr>
        <tr>
            <td>A16</td>
            <td><code>caeDueDate</code></td>
            <td>Fecha de vencimiento del CAE.</td>
            <td>DateTime</td>
            <td>—</td>
        </tr>
        <tr>
            <td>A17</td>
            <td><code>inclusionDate</code></td>
            <td>Fecha y hora de inclusión del documento en el sistema.</td>
            <td>DateTime</td>
            <td>—</td>
        </tr>
        <tr>
            <td>A23</td>
            <td><code>caeNumber</code></td>
            <td>Número del CAE.</td>
            <td>string</td>
            <td>—</td>
        </tr>
        <tr>
            <td>A34</td>
            <td><code>referenceNumber</code></td>
            <td>Número de referencia adicional.</td>
            <td>string</td>
            <td>50</td>
        </tr>
    </tbody>
</table>

### Valores y Condiciones Comerciales

<table border="1">
    <thead>
        <tr>
            <th width="50">ID</th>
            <th width="250">Campo</th>
            <th width="400">Descripción</th>
            <th width="100">Tipo</th>
            <th width="150">Tam. Máx.</th>
        </tr>
    </thead>
    <tbody height="20">
        <tr>
            <td>A18</td>
            <td><code>netAmount</code></td>
            <td>Subtotal (valor neto).</td>
            <td>decimal</td>
            <td>—</td>
        </tr>
        <tr>
            <td>A19</td>
            <td><code>totalAmount</code></td>
            <td>Valor total de la factura.</td>
            <td>decimal</td>
            <td>—</td>
        </tr>
        <tr>
            <td>A20</td>
            <td><code>ivaPercentage</code></td>
            <td>Porcentaje de IVA/impuesto.</td>
            <td>decimal</td>
            <td>—</td>
        </tr>
        <tr>
            <td>A21</td>
            <td><code>exchangeRate</code></td>
            <td>Tipo de cambio.</td>
            <td>decimal</td>
            <td>—</td>
        </tr>
        <tr>
            <td>A24</td>
            <td><code>currency</code></td>
            <td>Moneda de la factura.</td>
            <td>string</td>
            <td>10</td>
        </tr>
        <tr>
            <td>A25</td>
            <td><code>paymentMethod</code></td>
            <td>Método de pago.</td>
            <td>string</td>
            <td>50</td>
        </tr>
        <tr>
            <td>A26</td>
            <td><code>taxCondition</code></td>
            <td>Condición frente al IVA.</td>
            <td>string</td>
            <td>—</td>
        </tr>
        <tr>
            <td>A35</td>
            <td><code>paymentDetails</code></td>
            <td>Detalles sobre el pago de la factura.</td>
            <td>string</td>
            <td>200</td>
        </tr>
        <tr>
            <td>A58</td>
            <td><code>incoterm</code></td>
            <td>Incoterm aplicable a la transacción.</td>
            <td>string</td>
            <td>20</td>
        </tr>
        <tr>
            <td>A22</td>
            <td><code>observation</code></td>
            <td>Observaciones adicionales sobre la factura.</td>
            <td>string</td>
            <td>500</td>
        </tr>
    </tbody>
</table>

### Datos del Destinatario

<table border="1">
    <thead>
        <tr>
            <th width="25">ID</th>
            <th width="400">Campo</th>
            <th width="300">Descripción</th>
            <th width="25">Tipo</th>
            <th width="150">Tam. Máx.</th>
        </tr>
    </thead>
    <tbody height="20">
        <tr>
            <td>A27</td>
            <td><code>clientName</code></td>
            <td>Nombre del cliente destinatario.</td>
            <td>string</td>
            <td>100</td>
        </tr>
        <tr>
            <td>A28</td>
            <td><code>clientAddress</code></td>
            <td>Dirección del cliente destinatario.</td>
            <td>string</td>
            <td>200</td>
        </tr>
        <tr>
            <td>A29</td>
            <td><code>clientPostalCode</code></td>
            <td>Código postal del cliente.</td>
            <td>string</td>
            <td>20</td>
        </tr>
        <tr>
            <td>A30</td>
            <td><code>clientCity</code></td>
            <td>Ciudad del cliente.</td>
            <td>string</td>
            <td>100</td>
        </tr>
        <tr>
            <td>A31</td>
            <td><code>clientState</code></td>
            <td>Estado/Provincia del cliente.</td>
            <td>string</td>
            <td>50</td>
        </tr>
        <tr>
            <td>A32</td>
            <td><code>clientCountry</code></td>
            <td>País del cliente.</td>
            <td>string</td>
            <td>50</td>
        </tr>
        <tr>
            <td>A33</td>
            <td><code>clientDocumentNumber</code></td>
            <td>Número del documento del cliente (ej: RUT, CPF, CNPJ).</td>
            <td>string</td>
            <td>50</td>
        </tr>
    </tbody>
</table>

### Ítems de la Factura (lista — campo `items`)

<table border="1">
    <thead>
        <tr>
            <th width="25">ID</th>
            <th width="550">Campo</th>
            <th width="250">Descripción</th>
            <th width="50">Tipo</th>
            <th width="200">Tam. Máx.</th>
        </tr>
    </thead>
    <tbody height="20">
       <tr>
            <td>A38</td>
            <td><code>itemCode</code></td>
            <td>Código del artículo en la factura.</td>
            <td>string</td>
            <td>50</td>
        </tr>
        <tr>
            <td>A39</td>
            <td><code>quantity</code></td>
            <td>Cantidad del artículo.</td>
            <td>decimal</td>
            <td>-</td>
        </tr>
        <tr>
            <td>A40</td>
            <td><code>dispatchDate</code></td>
            <td>Fecha de despacho del artículo.</td>
            <td>DateTime</td>
            <td>-</td>
        </tr>
        <tr>
            <td>A41</td>
            <td><code>unitOfMeasure</code></td>
            <td>Unidad de medida (ej: KG).</td>
            <td>string</td>
            <td>20</td>
        </tr>
        <tr>
            <td>A42</td>
            <td><code>iclPricePerLiter</code></td>
            <td>ICL por litro.</td>
            <td>decimal</td>
            <td>-</td>
        </tr>
        <tr>
            <td>A43</td>
            <td><code>unitPrice</code></td>
            <td>Precio unitario del artículo.</td>
            <td>decimal</td>
            <td>-</td>
        </tr>
        <tr>
            <td>A44</td>
            <td><code>itemDiscount</code></td>
            <td>Descuento aplicado al artículo.</td>
            <td>decimal</td>
            <td>-</td>
        </tr>
        <tr>
            <td>A45</td>
            <td><code>itemDiscountPercentage</code></td>
            <td>Porcentaje de descuento aplicado.</td>
            <td>decimal</td>
            <td>-</td>
        </tr>
        <tr>
            <td>A46</td>
            <td><code>totalPrice</code></td>
            <td>Precio total del artículo después de descuentos.</td>
            <td>decimal</td>
            <td>-</td>
        </tr>
        <tr>
            <td>A47</td>
            <td><code>itemName</code></td>
            <td>Nombre/descripción del artículo.</td>
            <td>string</td>
            <td>100</td>
        </tr>
        <tr>
            <td>A48</td>
            <td><code>eanOrDun</code></td>
            <td>Código EAN o código de barras.</td>
            <td>string</td>
            <td>50</td>
        </tr>
        <tr>
            <td>A49</td>
            <td><code>referenceNumberItem</code></td>
            <td>Número de referencia del artículo.</td>
            <td>string</td>
            <td>50</td>
        </tr>
        <tr>
            <td>A50</td>
            <td><code>origin</code></td>
            <td>Origen del artículo.</td>
            <td>string</td>
            <td>50</td>
        </tr>
        <tr>
            <td>A51</td>
            <td><code>ncmOrHts</code></td>
            <td>Código NCM (mercadería) o HTS (tarifa aduanera).</td>
            <td>string</td>
            <td>50</td>
        </tr>
        <tr>
            <td>A52</td>
            <td><code>stockID</code></td>
            <td>Identificación del stock del artículo.</td>
            <td>string</td>
            <td>50</td>
        </tr>
        <tr>
            <td>A53</td>
            <td><code>packingUnit</code></td>
            <td>Unidad de embalaje.</td>
            <td>string</td>
            <td>20</td>
        </tr>
        <tr>
            <td>A54</td>
            <td><code>packingQuantity</code></td>
            <td>Cantidad de artículos por embalaje.</td>
            <td>decimal</td>
            <td>-</td>
        </tr>
    </tbody>
</table>

### Cargos Adicionales (lista — campo `additionalCharges`)

<table border="1">
    <thead>
        <tr>
            <th width="25">ID</th>
            <th width="600">Campo</th>
            <th width="250">Descripción</th>
            <th width="50">Tipo</th>
            <th width="200">Tam. Máx.</th>
        </tr>
    </thead>
    <tbody height="20">
       <tr>
            <td>A56</td>
            <td><code>additionalChargeDescription</code></td>
            <td>Descripción del cargo adicional.</td>
            <td>string</td>
            <td>200</td>
        </tr>
        <tr>
            <td>A57</td>
            <td><code>additionalChargeValue</code></td>
            <td>Valor del cargo adicional.</td>
            <td>decimal</td>
            <td>-</td>
        </tr>
    </tbody>
</table>

## Formatos de Archivo Soportados

El campo `mimeType` de la solicitud de importación acepta los siguientes valores:

<table border="1">
    <thead>
        <tr>
            <th width="300">Valor</th>
            <th width="600">Formato</th>
        </tr>
    </thead>
    <tbody height="20">
       <tr>
            <td><code>application/pdf</code></td>
            <td>Documento PDF</td>
        </tr>
        <tr>
            <td><code>image/png</code></td>
            <td>Imagen PNG</td>
        </tr>
        <tr>
            <td><code>image/jpeg</code></td>
            <td>Imagen JPEG</td>
        </tr>
        <tr>
            <td><code>image/jpg</code></td>
            <td>Imagen JPG</td>
        </tr>
        <tr>
            <td><code>image/bmp</code></td>
            <td>Imagen BMP</td>
        </tr>
        <tr>
            <td><code>image/pjpeg</code></td>
            <td>Imagen PJPEG</td>
        </tr>
        <tr>
            <td><code>image/x-png</code></td>
            <td>Imagen X-PNG</td>
        </tr>
    </tbody>
</table>

## Procesadores Disponibles

El campo `processor` define qué motor de inteligencia artificial será utilizado para el procesamiento del documento. La elección del procesador puede afectar la precisión y el tiempo de procesamiento.

<table border="1">
    <thead>
        <tr>
            <th width="200">Valor</th>
            <th width="600">Procesador</th>
        </tr>
    </thead>
    <tbody height="20">
       <tr>
            <td><code>1</code></td>
            <td>DocumentAI</td>
        </tr>
        <tr>
            <td><code>3</code></td>
            <td>Gemini 2.5 Pro</td>
        </tr>
        <tr>
            <td><code>5</code></td>
            <td>DocumentAI + Gemini 2.5 Pro</td>
        </tr>
        <tr>
            <td><code>6</code></td>
            <td>Gemini 3.0 Flash</td>
        </tr>
        <tr>
            <td><code>7</code></td>
            <td>Gemini 3.0 Flash Lite</td>
        </tr>
        <tr>
            <td><code>8</code></td>
            <td>Gemini 3.0 Pro</td>
        </tr>
        <tr>
            <td><code>9</code></td>
            <td>DocumentAI + Gemini 3.0 Flash</td>
        </tr>
        <tr>
            <td><code>10</code></td>
            <td>DocumentAI + Gemini 3.0 Flash Lite</td>
        </tr>
        <tr>
            <td><code>11</code></td>
            <td>DocumentAI + Gemini 3.0 Pro</td>
        </tr>
        <tr>
            <td><code>12</code></td>
            <td>Gemini 3.5 Flash</td>
        </tr>
        <tr>
            <td><code>13</code></td>
            <td>Gemini 3.1 Flash Lite</td>
        </tr>
        <tr>
            <td><code>14</code></td>
            <td>DocumentAI + Gemini 3.5 Flash </td>
        </tr>
        <tr>
            <td><code>15</code></td>
            <td>DocumentAI + Gemini 3.1 Flash Lite </td>
        </tr>
    </tbody>
</table>

## Buenas Prácticas y Limitaciones

- **Un documento por archivo:** No se recomienda importar más de una factura en un mismo archivo PDF. Los documentos con múltiples facturas pueden reducir la precisión del procesamiento.
- **Calidad del archivo:** Los documentos con buena resolución y contraste suelen generar resultados más precisos en la extracción de datos.
- **Validez del hash:** El hash MD5 de autenticación expira en 5 minutos. Asegúrese de generar un nuevo hash en cada solicitud.
- **Procesamiento asíncrono:** El procesamiento de los documentos no es instantáneo. Implemente una lógica de polling (consultas periódicas) para verificar el resultado de la extracción.
- **Almacenamiento del EmpAK:** El `EmpAK` devuelto en el registro de la empresa debe almacenarse de forma persistente y segura, ya que es necesario para todas las operaciones posteriores.