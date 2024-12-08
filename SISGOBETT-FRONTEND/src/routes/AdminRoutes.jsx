import React from 'react';
import { Route } from 'react-router-dom';
import CustomHeader from '../container/Sidebar/Header';
import AdminDashboard from '../views/Admin/Dashboard';
import Branches_Points from '../views/Admin/Branches_Points';
import Clients from '../views/Admin/Clients';
import Fabrics from '../views/Admin/Fabrics';
import CreateComponentFabric from '../views/Admin/CreateComponentFabric';

const AdminRoutes = () => {
    return (
        <>
            {/* Coloca aquí el encabezado personalizado para el administrador si es necesario */}
            <CustomHeader title={"SISGOBETT"} />
            
            {/* Definición de las rutas protegidas para el administrador */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/branches" element={<Branches_Points />} />
            <Route path="/admin/clients" element={<Clients />} />
            <Route path="/admin/fabrics" element={<Fabrics />} />
            <Route path="/admin/fabric/create" element={<CreateComponentFabric />} />
        </>
    );
};

export default AdminRoutes;
