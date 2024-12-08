import { Button, Col, Flex, Grid, Row, Skeleton, Space, Spin, Input, Modal, Checkbox, Select } from 'antd'
import React, { useState } from 'react'
import logo from '../../assets/Logo Gobett.png'
import TableBranches from '../../components/Tables/TableBranches'
import { useBranches } from '../../services/Branches'
import { BarChartOutlined, PlusOutlined } from '@ant-design/icons'
import ModalBranch from '../../components/Modals/ModalBranch'
import { generateBranchReport } from '../../utils/admin/BranchReport'
import { pdf } from '@react-pdf/renderer'
import { message } from 'antd'
import axios from 'axios'
import config from '../../config'
import { useSales } from '../../services/Sales'
import { useRolls } from '../../services/Rolls'

const Branches_Points = () => {
  const { data: branches, isLoading, isFetched } = useBranches()
  const {data: rolls, isLoading: isLoadingRolls, isFetched: isFetchedRolls} = useRolls({
    pagination:{
      page: 1,
      pageSize: 1000
    }
  })
  const { data: sales, isLoading: isLoadingSales, isFetched: isFetchedSales } = useSales(null, null,{
    pagination:{
      page: 1,
      pageSize: 1000
    }
  })
  const [modalOpen, setModalOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [reportModalVisible, setReportModalVisible] = useState(false)
  const [reportOptions, setReportOptions] = useState({
    showInventory: true,
    showSalesStats: true,
    showEmployees: true
  })
  const [selectedBranches, setSelectedBranches] = useState([])

  if (isLoading || isLoadingRolls || isLoadingSales) return (
    <Spin spinning={isLoading || isLoadingRolls || isLoadingSales} tip='Cargando datos de las sucursales'>
      <img 
        src={logo}
        alt="Logo"
        style={{
          width: 100,
          height: 100,
          display: 'block',
          margin: '20px auto'
        }}
      />
    </Spin>
  )

  const handleCloseModal = () => {
    setModalOpen(false)
  }

  const handleGenerateReport = async () => {
    try {
      const filteredBranches = selectedBranches.length > 0
        ? branches.data.filter(branch => selectedBranches.includes(branch.id))
        : branches.data;

      const reportData = {
        branches: filteredBranches,
        rolls: rolls?.data,
        sales: sales?.data,
        options: reportOptions
      }
      
      const blob = await pdf(generateBranchReport(reportData)).toBlob()
      const url = URL.createObjectURL(blob)
      window.open(url)
      setReportModalVisible(false)
    } catch (error) {
      console.error('Error al generar reporte:', error)
      message.error('Error al generar el reporte')
    }
  }


  return (
    <Row>
      <Col xs={24}>
        <Row style={{ padding: { xs: '16px', sm: '24px' }, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ 
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: '16px', sm: '0' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            borderBottom: '2px solid #f0f0f0',
            paddingBottom: '12px'
          }}>
            <div>
              <h1 style={{ 
                margin: 0,
                fontSize: { xs: '24px', sm: '32px' },
                background: 'linear-gradient(45deg, #ff4d4f, #ff7875)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                Gestión de Sucursales
              </h1>
              <p style={{ 
                margin: '8px 0 0', 
                color: '#8c8c8c',
                fontSize: { xs: '14px', sm: '16px' },
                fontWeight: 500
              }}>
                {branches?.data?.length || 0} sucursales registradas
              </p>
            </div>
            <Space size="middle" wrap>
              <Button 
                icon={<BarChartOutlined />}
                onClick={() => setReportModalVisible(true)}
                type='default'
                size='middle'
                style={{ 
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  borderColor: '#ff4d4f',
                  color: '#ff4d4f'
                }}
              >
                Generar Reporte
              </Button>
              <Button 
                onClick={() => setModalOpen(true)} 
                icon={<PlusOutlined />} 
                type='primary'
                size='large'
                style={{ 
                  borderRadius: '8px',
                  background: '#ff4d4f',
                  boxShadow: '0 2px 4px rgba(255,77,79,0.3)',
                  border: 'none'
                }}
              >
                Crear sucursal
              </Button>
            </Space>
          </div>

         

          <TableBranches />
          <ModalBranch
            open={modalOpen}
            onCancel={handleCloseModal}
          />
          <Modal
            title="Opciones de Reporte"
            open={reportModalVisible}
            onCancel={() => setReportModalVisible(false)}
            onOk={handleGenerateReport}
            okText="Generar"
            cancelText="Cancelar"
            okButtonProps={{
              style: { background: '#ff4d4f', borderColor: '#ff4d4f' }
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <p style={{ marginBottom: '8px', fontWeight: 500 }}>Seleccionar Sucursales</p>
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder="Todas las sucursales"
                  value={selectedBranches}
                  onChange={setSelectedBranches}
                  options={branches?.data.map(branch => ({
                    value: branch.id,
                    label: branch.attributes.name
                  }))}
                  allowClear
                />
              </div>
              <Checkbox
                checked={reportOptions.showInventory}
                onChange={e => setReportOptions({...reportOptions, showInventory: e.target.checked})}
              >
                Incluir inventario actual
              </Checkbox>
              <Checkbox
                checked={reportOptions.showSalesStats}
                onChange={e => setReportOptions({...reportOptions, showSalesStats: e.target.checked})}
              >
                Incluir estadísticas de ventas
              </Checkbox>
            </Space>
          </Modal>
        </Row>
      </Col>
    </Row>
  )
}

export default Branches_Points
