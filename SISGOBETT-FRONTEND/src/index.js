import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools'

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ConfigProvider
    theme={{
      components: {
        Table: {
          headerColor: '#4F646F',
          cellFontSizeSM: 12,
        },
        Menu: {
          itemHoverBg: 'rgba(0, 0, 0, 0.02)',
          itemActiveBg: 'rgba(256, 50, 0, 0.05)',
          itemSelectedBg: 'rgba(256, 0, 0, 0.05)',
          itemSelectedColor: '#FB120E',
        },
        Button: {
          colorPrimaryHover: '#4F646F',

        },
        Spin: {
          colorPrimary: '#FB120E'
        },
        Steps: {
          colorPrimary: '#FB120E',
          colorBgContainer: '#FB120E',
          finishIconBorderColor: '#FB120E'
        }
      }
    }}>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </ConfigProvider >
);


