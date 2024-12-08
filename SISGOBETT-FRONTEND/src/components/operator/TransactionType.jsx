import { CalculatorOutlined, FileTextOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import { Flex, Radio } from 'antd'
import React from 'react'

const TransactionType = ({ transactionType, setTransactionType }) => {
  const handleChange = (e) => {
    setTransactionType(e.target.value);
  };

  return (
    <>
      <h4 className='order-title'>TIPO DE TRANSACCIÓN</h4>
      <hr className='order-divider' />
    
      <Radio.Group 
        value={transactionType} 
        onChange={handleChange} 
        buttonStyle="solid" 
        style={{ width: '100%' }}
      >
        <Flex style={{ width: '100%' }}>
          <Radio.Button 
            style={{ flex: 1, textAlign: 'center' }} 
            value="VENTA"
            onMouseEnter={(e) => e.currentTarget.style.color = 'red'}
            onMouseLeave={(e) => e.currentTarget.style.color = ''}
          >
            <Flex justify="center" align="center">
              <ShoppingCartOutlined style={{ marginRight: '8px' }} /> VENTA
            </Flex>
          </Radio.Button>
          <Radio.Button 
            style={{ flex: 1, textAlign: 'center' }} 
            value="PEDIDO"
            onMouseEnter={(e) => e.currentTarget.style.color = 'red'}
            onMouseLeave={(e) => e.currentTarget.style.color = ''}
          >
            <Flex justify="center" align="center">
              <FileTextOutlined style={{ marginRight: '8px' }} /> PEDIDO
            </Flex>
          </Radio.Button>
         
        </Flex>
      </Radio.Group>
      <style jsx>{`
        .ant-radio-button-wrapper-checked {
          background-color: #ff4d4f !important;
          border-color: #ff4d4f !important;
        }
      `}</style>
    </>
  )
}

export default TransactionType
