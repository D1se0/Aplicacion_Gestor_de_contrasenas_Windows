# 🔐 Password Manager Local (BETA)

Gestor de contraseñas **100% local**, enfocado en **seguridad, privacidad y control total del usuario**.  
No utiliza servidores externos ni servicios cloud: **todo ocurre en tu máquina**.

⚠️ **Estado del proyecto:**  
Este proyecto se encuentra actualmente en **fase BETA / desarrollo activo**.  
No existe una release estable por el momento.

---

## ✨ Características principales

- 🔒 **Gestor de contraseñas local** (sin servidores externos)
- 🧠 **Cifrado fuerte AES-256-GCM**
- 🔑 **Derivación de claves con PBKDF2**
- 🗄️ **Base de datos SQLite3 local**
- 🧪 Proyecto en desarrollo (modo `dev` recomendado)
- 🌐 Modo **Web local**
- 🖥️ Modo **Aplicación de escritorio (Tauri)**

---

## 🎨 Diseño y experiencia de usuario

- **Estética Glassmorphism**
  - Blur
  - Transparencias
  - Efectos de profundidad
- **Animaciones fluidas** con **Framer Motion**
- **Paleta de colores oscuros**
  - Tonos morados y negros
  - Contraste alto pero agradable
- Interfaz moderna, limpia y enfocada en usabilidad

---

## 🖼️ Capturas de pantalla

<img width="1169" height="462" alt="1" src="https://github.com/user-attachments/assets/3edd604a-5d42-4771-9301-f02eb784296c" />
<img width="867" height="661" alt="2" src="https://github.com/user-attachments/assets/41d620af-3056-45e3-9ed8-ab2cc86cbaad" />
<img width="801" height="433" alt="3" src="https://github.com/user-attachments/assets/c89c1ba0-35e3-4cb4-b7f6-e288263f5786" />
<img width="1188" height="474" alt="4" src="https://github.com/user-attachments/assets/da20c148-e55d-4fb5-8a8e-ddd7055e3839" />
<img width="1203" height="684" alt="5" src="https://github.com/user-attachments/assets/3352a326-211e-42b3-b409-a96946603c47" />
<img width="1225" height="690" alt="6" src="https://github.com/user-attachments/assets/58d3910e-b63a-47dd-9839-98504f2e6ce6" />
<img width="749" height="632" alt="7" src="https://github.com/user-attachments/assets/e8235b84-8373-4dd4-b2c8-72cc9455ab5d" />

---

## 🧠 Seguridad (punto clave del proyecto)

Este proyecto prioriza la **seguridad real**, no solo estética.

### 🔐 Cifrado y claves
- **AES-256-GCM** para cifrado simétrico
- **PBKDF2** para derivar claves
- Uso de **salts únicos**
- Nada sensible se almacena en texto plano

### 🧠 Gestión de la master key
- La **master password NO se guarda**
- La clave derivada:
  - Solo vive en **RAM**
  - Se elimina al cerrar la bóveda
- Al cerrar la aplicación o la bóveda:
  - La memoria se limpia

### 🗄️ Base de datos
- SQLite3 local
- Políticas estrictas:
  - No hay datos sensibles en claro
  - Todo está cifrado antes de almacenarse
- El cifrado/descifrado se realiza **exclusivamente en el cliente**

### 🌐 Sin servidores
- ❌ No hay backend remoto
- ❌ No hay APIs externas
- ❌ No hay tracking
- ✅ Control total del usuario

---

## 🛠️ Tecnologías utilizadas

### Frontend
- **TypeScript**
- **React 18**
- **Vite**
- **Framer Motion**
- **CSS moderno (glassmorphism)**

### Backend (local)
- **Node.js (20.20.0 recomendado)**
- **TypeScript**
- **SQLite3**

### App de escritorio
- **Tauri**
- **Rust**
- **Visual Studio 2022/2026 (Build Tools C++)**

> Programado principalmente con **Visual Studio / Visual Studio Code**

---

## 🌐 Modo Web (RECOMENDADO)

### ✅ Ventajas
- Más sencillo de usar
- Menos dependencias
- Ideal para la mayoría de usuarios
- Funciona completamente en local

### ▶️ Ejecución

```bash
pnpm dev
```

Pero esta la opción automatica que es ejecutando simplemente `run.bat` y ya hace todo lo técnico (Instalando previamente las dependencias, leer README.txt de la carpeta)

```bash
run.bat
```

Luego abre:

```
http://127.0.0.1:5173
```

---

## 🖥️ Modo Aplicación de Escritorio (Tauri)

> ⚠️ Advertencia importante

Actualmente:

- ❌ El modo release NO es estable
- ✅ Solo funciona correctamente en modo dev / debug

### 🧩 Requisitos adicionales

- Node.js 20.20.0
- pnpm
- Rust
- Visual Studio Build Tools (C++)
- Windows SDK

▶️ Ejecución

```bash
pnpm tauri dev
```

Pero esta la opción automatica que es ejecutando simplemente `run.bat` y ya hace todo lo técnico (Instalando previamente las dependencias, leer README.txt de la carpeta)

```bash
run.bat
```

> ⚠️ Mover la carpeta del proyecto puede romper rutas en modo dev
Se recomienda mantener la estructura intacta.

---

## 🚧 Estado del proyecto

- 🧪 BETA
- 🚫 Sin release estable aún
- 🛠️ Cambios frecuentes
- 🧩 Algunas partes requieren refactorización

Cualquier fork, PR o mejora es más que bienvenida 🙌

---

## 🤝 Contribuciones

Si te interesa:

Mejorar estabilidad
- Ayudar con el modo release
- Optimizar seguridad
- Mejorar UI/UX

👉 Un fork o pull request sería genial

---

## 📌 Notas finales

Este proyecto está pensado para personas que:
- Valoran la privacidad
- Prefieren soluciones locales
- No confían en servicios externos para sus credenciales

Si buscas algo:
- Transparente
- Seguro
- Sin dependencias cloud

👉 Este proyecto es para ti.

---

🖤 Proyecto en desarrollo. Hecho con mimo y foco en seguridad.
