import { FaEye, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

export const optionsHeader =  [
  {
    label: 'Sucursales',
    options: [
      { value: 'listarSucursales', label: 'Listar Sucursales', description: 'Ver todas las sucursales existentes' },
      { value: 'crearSucursal', label: 'Crear Sucursal', description: 'Agregar una nueva sucursal' },
      { value: 'editarSucursal', label: 'Editar Sucursal', description: 'Editar información de una sucursal existente' },
      { value: 'eliminarSucursal', label: 'Eliminar Sucursal', description: 'Eliminar una sucursal existente' }
    ],
  },
  {
    label: 'Clientes',
    options: [
      { value: 'listarClientes', label: 'Listar Clientes', description: 'Ver todos los clientes existentes' },
      { value: 'crearCliente', label: 'Crear Cliente', description: 'Agregar un nuevo cliente' },
      { value: 'editarCliente', label: 'Editar Cliente', description: 'Editar información de un cliente existente' },
      { value: 'eliminarCliente', label: 'Eliminar Cliente', description: 'Eliminar un cliente existente' }
    ],
  },
  {
    label: 'Telas',
    options: [
      { value: 'listarTelas', label: 'Listar Telas', description: 'Ver todas las telas existentes' },
      { value: 'crearTela', label: 'Crear Tela', description: 'Agregar una nueva tela' },
      { value: 'editarTela', label: 'Editar Tela', description: 'Editar información de una tela existente' },
      { value: 'eliminarTela', label: 'Eliminar Tela', description: 'Eliminar una tela existente' }
    ],
  },
  // Agrega más opciones de gestión de inventario, control de ventas, etc.
  {
    label: 'Cuentas',
    options: [
      { value: 'listarUsuarios', label: 'Listar Usuarios', description: 'Ver todos los usuarios registrados' },
      { value: 'crearUsuario', label: 'Crear Usuario', description: 'Agregar un nuevo usuario' },
      { value: 'editarUsuario', label: 'Editar Usuario', description: 'Editar información de un usuario existente' },
      { value: 'eliminarUsuario', label: 'Eliminar Usuario', description: 'Eliminar un usuario existente' }
    ],
  },
];