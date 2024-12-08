import axios from 'axios';
const apiURL = 'http://localhost:1337/api'

const authService = {
    getRole: async (user) => {
        try {
            const response = await fetch(`${apiURL}/users/me?populate=*`, {
                headers: { Authorization: 'Bearer ' + user.jwt }
            });
            const userInfo = await response.json();
            
            if (userInfo) {
                localStorage.setItem('user_id', userInfo.id);
                localStorage.setItem('username', userInfo.username);
                localStorage.setItem('user_email', userInfo.email);
                localStorage.setItem('user_firstname', userInfo.firstname || '');
                localStorage.setItem('user_lastname', userInfo.lastname || '');
                
                if (userInfo.branch) {
                    localStorage.setItem('selected_branch', userInfo.branch.id);
                    localStorage.setItem('branch_name', userInfo.branch.name);
                }
            }
            
            return userInfo ? { 
                jwt: user.jwt, 
                role: userInfo.role,
                userData: {
                    id: userInfo.id,
                    username: userInfo.username,
                    email: userInfo.email,
                    firstname: userInfo.firstname,
                    lastname: userInfo.lastname
                }
            } : null;
        } catch (error) {
            console.error('Error al obtener información del usuario:', error);
            return null;
        }
    },

    login: async (identifier, password) => {
        try {
            const response = await axios.post(`${apiURL}/auth/local`, {
                identifier,
                password
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    logout: () => {
        const keysToRemove = [
            'sisgbt-jwtoken',
            'sis_role',
            'user_id',
            'username',
            'user_email',
            'user_firstname',
            'user_lastname',
            'selected_branch',
            'branch_name'
        ];
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
    },

    updateUserBranch: async (userId, branchId, branchName) => {
        try {
            const token = localStorage.getItem('sisgbt-jwtoken');
            await axios.put(`${apiURL}/users/${userId}`, {
                branch: branchId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            localStorage.setItem('selected_branch', branchId);
            localStorage.setItem('branch_name', branchName);
        } catch (error) {
            console.error('Error al actualizar la sucursal del usuario:', error);
            throw error;
        }
    }
};

export default authService;