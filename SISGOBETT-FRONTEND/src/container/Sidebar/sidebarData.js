import {
    BsShop,
    BsPersonVideo2,
    BsBoxSeam,
    BsAlignBottom,
    BsTags,
    BsPalette2,
    BsPinFill,
    BsCashStack,
    BsListCheck,
    BsJournalCheck,
    BsJournalText,
    BsCalendar2Check,
    BsBarChartFill,
    BsPcDisplayHorizontal,
    BsGraphUp,
    BsArrowLeftRight,
    BsArchive,
} from 'react-icons/bs'
import { SettingOutlined, ShoppingOutlined, UserOutlined } from '@ant-design/icons'
import { GoReport } from 'react-icons/go';
import { TbReportAnalytics } from 'react-icons/tb';

export const menuData = [
    {
        key: 0,
        title: 'Plataforma',
        icon: <ShoppingOutlined />,
        path: '/admin'
    },
    {
        key: 1,
        title: 'Sucursales',
        icon: <BsShop />,
        path: '/admin/branches'
    },
    {
        key: 2,
        title: 'Clientes',
        icon: <BsPersonVideo2 />,
        path: '/admin/clients'
    },
    {
        key: 3,
        title: 'Gestion de Telas',
        icon: <BsPalette2 />,
        children: [
            {
                key: 4,
                title: 'Telas',
                icon: <BsAlignBottom />,
                path: '/admin/fabrics'
            },
            {
                key: 5,
                title: 'Proovedores',
                icon: <BsTags />,
                path: '/admin/suppliers'
            },
            {
                key: 6,
                title: 'Categorias',
                icon: <BsPinFill />,
                path: '/admin/categories'
            },
            {
                key: 7,
                title: 'Promociones',
                icon: <BsTags />,
                path: '/admin/promos'
            },
        ],
    },
    {
        key: 8,
        title: 'Inventario',
        icon: <BsArchive />,
        children: [
            {
                key: 9,
                title: 'Almacenes',
                icon: <BsBoxSeam />,
                path: '/admin/warehouses'
            },
        /*     {
                key: 10,
                title: 'Traspasos',
                icon: <BsArrowLeftRight />,
                path: '/admin/transfers'
            }, */

        ],
    },
    {
        key: 14,
        title: 'Ventas',
        icon: <BsJournalCheck />,
        path: '/admin/sales'
    },
    {
        key: 17,
        title: 'Operadores',
        icon: <UserOutlined />,
        path: '/admin/operators'
    }, 
/*     {
        key: 16,
        title: 'Configuracion de empresa',
        icon: <SettingOutlined />,
        path: '/admin/config'
    },  */
];