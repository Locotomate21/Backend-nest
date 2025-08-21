
📘 Proyecto: Sistema de Gestión de Residencias Universitarias
👨‍💻 Autor

Nombre: Carlos Losada

Evidencia: GA7-220501096-AA3-EV01 – Codificación de módulos del software

📌 Descripción del Proyecto

Este proyecto corresponde al desarrollo del módulo de gestión de residentes y habitaciones para un sistema de residencias universitarias.
Fue implementado con NestJS como framework backend y MongoDB como base de datos.

🏗️ Módulos desarrollados
🔹 Módulo de Residentes

Archivos principales:

resident.module.ts

resident.controller.ts

resident.service.ts

schemas/resident.schema.ts

dto/create-resident.dto.ts

dto/update-resident.dto.ts

Funcionalidades:

Crear residente

Consultar todos los residentes

Consultar residente por ID

Actualizar residente

Eliminar residente

🔹 Módulo de Habitaciones

Archivos principales:

room.module.ts

room.controller.ts

room.service.ts

schemas/room.schema.ts

dto/create-room.dto.ts

dto/update-room.dto.ts

Funcionalidades:

Crear habitación

Consultar todas las habitaciones

Consultar habitación por ID

Actualizar habitación

Eliminar habitación

📖 Historias de Usuario Implementadas
HU-01: Registrar residente

Como representante deseo registrar un residente para poder llevar el control de la residencia universitaria.

HU-02: Consultar listado de residentes

Como administrador deseo visualizar todos los residentes registrados para gestionarlos.

HU-03: Registrar habitación

Como administrador deseo registrar una habitación para asignarla a residentes.
