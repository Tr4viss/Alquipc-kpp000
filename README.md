#  AlquiPC - Dashboard de renta de equipos

Proyecto desarrollado con **HTML, CSS y JavaScript**, siguiendo un diseño inspirado en la interfaz de **Discord**.  
Incluye un sistema básico de facturación, historial de facturas, gestión de clientes y sección de ayuda, todo con **almacenamiento en LocalStorage**.

---

##  Instrucciones de uso

1. **Descargar el proyecto**  
   Descomprima el archivo `.zip` en su computadora.

2. **Abrir el Dashboard**  
   Abra el archivo `index.html` en su navegador.  
   Desde allí podrá navegar a todas las secciones usando la **barra lateral**.

3. **Navegación principal**  
   -  **Inicio** → Vista principal del dashboard.  
   -  **Facturación** → Permite registrar una nueva factura.  
   -  **Historial** → Consulta todas las facturas creadas y gestionadas.  
   -  **Clientes** → Registro y gestión de clientes.  
   -  **Ayuda** → Instrucciones de uso y contacto.

---

##  Detalle de cada sección

###  Inicio (`index.html`)
- Pantalla de bienvenida al sistema.
- Acceso rápido a las demás secciones.

###  Facturación (`facturacion.html`)
- Formulario para registrar facturas:  
  - Datos del cliente.  
  - Producto / servicio.  
  - Precio, días de alquiler, descuentos.  
- **Genera automáticamente el valor total** y muestra un recibo.  
- Cada factura registrada se guarda en **LocalStorage** y pasa al **Historial**.

###  Historial (`historial.html`)
- Lista todas las facturas generadas.  
- Opciones:  
  - Ver factura completa.  
  - Eliminar factura del historial.  
- Persistencia garantizada gracias a **LocalStorage** (no se borran al recargar).

###  Clientes (`clientes.html`)
- Registro de clientes con nombre, cédula y correo.  
- Almacena en **LocalStorage**.  
- Tabla dinámica con opción de eliminar registros.

###  Ayuda (`ayuda.html`)
- Guía rápida de uso del sistema.  
- Botón de contacto (vía correo electrónico).

---

##  Estilo visual
- Tema **oscuro tipo Discord** (colores #2C2F33 y #23272A).  
- **Sidebar fija** para navegación lateral.  
- **Topbar** en cada página.  
- Botones y formularios estilizados para mantener consistencia con el diseño.

---

##  Datos y almacenamiento
- Toda la información se guarda en **LocalStorage del navegador**.  
- Los datos se mantienen incluso al cerrar y volver a abrir el navegador (hasta que se limpien manualmente).

---

##  Estructura del proyecto
alquipc-kpp000/
│
├── index.html # Dashboard principal
├── facturacion.html # Formulario de facturación
├── historial.html # Historial de facturas
├── clientes.html # Gestión de clientes
├── ayuda.html # Instrucciones y contacto
│
├── css/
│ └── styles.css # Estilos globales (tema Discord)
│
├── js/
│ └── app.js # Lógica de facturación, historial y clientes
│
└── README.md # Instrucciones del proyecto


---

##  Detalles relevantes
- Proyecto **multi-página**: cada sección tiene su propio `.html`.  
- Uso de **LocalStorage** en vez de base de datos (más simple y portable).  
- Validaciones básicas en formularios (campos obligatorios).  
- Ideal para práctica de frontend.  

---

 **Autor**: Proyecto creado por Kevin Andrés Palacios Rivas

