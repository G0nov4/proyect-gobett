import React, { useState, useMemo } from 'react';
import { Badge, Button, Card, Col, Modal, Row, Skeleton, Space, Tabs, Table } from 'antd';
import './FabricList.css';
import { useFabrics } from '../../services/Fabrics';
import { LineChartOutlined, RollbackOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const API_URL =  'http://localhost:1337';

const FabricCard = ({ fabric, onClick }) => {
  const { 
    name, 
    fabric_images, 
    colors, 
    wholesale_price 
  } = fabric.attributes || {};
  const imageUrl = fabric_images?.data?.[0]?.attributes?.url;

  return (
    <Card hoverable className="ant-card" size='small' onClick={onClick}>
      <div className="card-image-container">
        {imageUrl ? (
          <img src={`${API_URL}${imageUrl}`} alt={`Image of ${name}`} className="card-image" />
        ) : (
          <div className="no-image-placeholder">No Image</div>
        )}
      </div>
      <div className="card-title">{name || "Tela sin nombre"}</div>
      <Space size={4} style={{ flexWrap: 'wrap' }}>
        {colors?.data?.map((color) => (
          <div
            key={color.id}
            className="color-dot"
            style={{ 
              backgroundColor: color.attributes.color,
              borderRadius: '50%'
            }}
            title={color.attributes.name}
          />
        ))}
      </Space>
      <div className="price-button-container">
        <div className="price">
          Bs. {wholesale_price || "N/A"}
          <span className="per-meter"> /metro</span>
        </div>
      </div>
      <Button block type='dashed' danger>Añadir al carrito</Button>
    </Card>
  );
};

const ColorSection = ({ colors, onColorSelect }) => {
  if (!colors?.data) return null;

  return (
    <Row gutter={[16, 16]} style={{ padding: '20px' }}>
      {colors.data.map((color, index) => (
        <Col xs={12} sm={8} md={6} lg={6} key={color.id}>
          <div 
            className="color-box-container" 
            onClick={() => onColorSelect(color)}
          >
            <div 
              className="color-box"
              style={{ backgroundColor: color.attributes.color }}
            >
              <span className="color-number">#{index + 1}</span>
            </div>
            <div className="color-box-info">
              <div className="color-box-name">{color.attributes.name}</div>
            </div>
          </div>
        </Col>
      ))}
    </Row>
  );
};

const RollsSection = ({ rolls, onRollSelect, selectedRolls }) => {
  if (!rolls?.data) return null;

  const availableRolls = rolls.data.filter(roll => roll.attributes.status === 'DISPONIBLE');

  const rollsByColor = availableRolls.reduce((acc, roll) => {
    const colorId = roll.attributes.color?.data?.id;
    if (!acc[colorId]) {
      acc[colorId] = {
        color: roll.attributes.color?.data?.attributes,
        rolls: []
      };
    }
    acc[colorId].rolls.push(roll);
    return acc;
  }, {});

  const isRollSelected = (rollId) => {
    return selectedRolls.some(roll => roll.id === rollId);
  };

  const handleRollClick = (roll) => {
    if (isRollSelected(roll.id)) {
      // Deseleccionar el rollo
      onRollSelect(roll, true); // Añadimos un segundo parámetro para indicar que es deselección
    } else {
      // Seleccionar el rollo
      onRollSelect(roll, false);
    }
  };

  return (
    <div className="rolls-grid">
      {Object.values(rollsByColor).map(({ color, rolls }) => (
        <div key={color.id} className="color-group">
          <div className="color-header" style={{ backgroundColor: color.color }}>
            {color.name}
          </div>
          <div className="rolls-container">
            <Row gutter={[8, 8]}>
              {rolls.map(roll => (
                <Col xs={12} md={8} lg={6} key={roll.id}>
                  <div 
                    className={`roll-card ${isRollSelected(roll.id) ? 'selected' : ''}`}
                    style={{ 
                      borderLeft: `4px solid ${color.color}`,
                      backgroundColor: isRollSelected(roll.id) ? `${color.color}33` : 'transparent'
                    }}
                    onClick={() => handleRollClick(roll)}
                  >
                    <div className="roll-info">
                      <div className="roll-code">{roll.attributes.code}</div>
                      <div className="roll-footage">
                        {roll.attributes.roll_footage} {roll.attributes.unit}
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </div>
      ))}
    </div>
  );
};

const FabricList = ({ addToOrderList, selectedCategory }) => {
  const { data: fabricsData, isError, isLoading } = useFabrics('id', 'asc',{
    available_status: {
      $eq: true
    }
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFabric, setSelectedFabric] = useState(null);
  const [selectedRolls, setSelectedRolls] = useState([]);

  const filteredFabrics = useMemo(() => {
    if (!selectedCategory || !fabricsData?.data) {
      return fabricsData?.data;
    }

    return fabricsData.data.filter(fabric => {
      const fabricCategories = fabric.attributes.categories?.data || [];
      return fabricCategories.some(category => category.id === selectedCategory);
    });
  }, [fabricsData, selectedCategory]);

  if (isError) return <div>Error al cargar las telas</div>;
  if (isLoading) {
    return (
      <Space style={{ margin: '0px 0px 10px 0px' }}>
        <Skeleton.Button active={true} shape='default' block />
      </Space>
    );
  }

  const handleCardClick = (fabric) => {
    setSelectedFabric(fabric);
    setIsModalVisible(true);
  };

  const handleColorSelect = (color) => {
    const colorData = {
        color: color.attributes.color,
        name: color.attributes.name,
        id: color.id
    };
    addToOrderList({
        ...selectedFabric.attributes,
        id: selectedFabric.id
    }, colorData);
    setIsModalVisible(false);
};

  const handleRollSelect = (roll, isDeselecting) => {
    if (isDeselecting) {
        setSelectedRolls(selectedRolls.filter(r => r.id !== roll.id));
        addToOrderList({
            ...selectedFabric.attributes,
            id: selectedFabric.id
        }, roll, true, true);
    } else {
        const rollWithFabric = {
            ...roll,
            fabric: {
                ...selectedFabric.attributes,
                id: selectedFabric.id
            }
        };
        setSelectedRolls([...selectedRolls, rollWithFabric]);
        addToOrderList({
            ...selectedFabric.attributes,
            id: selectedFabric.id
        }, roll, true, false);
    }
};

  return (
    <Row gutter={[8, 8]}>
      {filteredFabrics?.map((fabric, index) => (
        <Col
          key={index}
          xs={12}
          sm={12}
          md={6}
        >
          <FabricCard fabric={fabric} onClick={() => handleCardClick(fabric)} />
        </Col>
      ))}
      <Modal
        title={''}
        centered
        width={900}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        bodyStyle={{ 
          maxHeight: 'calc(100vh - 100px)', // Altura máxima del modal
          overflow: 'auto', // Habilita el scroll
          padding: '24px'
        }}
      >
        <Row gutter={[16, 16]} justify={{ sm: 'center', lg: 'start' }}>
          <Col lg={8} sm={24}>
            <div className="modal-content">
              {selectedFabric?.attributes?.fabric_images?.data?.[0]?.attributes?.url ? (
                <img
                  src={`${API_URL}${selectedFabric.attributes.fabric_images.data[0].attributes.url}`}
                  alt={`Image of ${selectedFabric.attributes.name}`}
                  className="modal-image"
                />
              ) : (
                <div className="no-image-placeholder">No Image</div>
              )}
              <div className="modal-title" style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '4px' }}>
                {selectedFabric?.attributes?.name || "Tela sin nombre"}
              </div>
              <div className="modal-description" style={{ fontSize: '0.8rem', color: '#666666', borderBottom: '1px solid #e8e8e8', paddingBottom: '4px', marginBottom: '8px', width: '100%', textAlign: 'center' }}>
                {selectedFabric?.attributes?.description || "Sin descripción"}
              </div>
              <Space size={4} style={{ flexWrap: 'wrap' }}>
                {selectedFabric?.attributes?.colors?.data?.map((color) => (
                  <div
                    key={color.id}
                    className="color-dot"
                    style={{ 
                      backgroundColor: color.attributes.color,
                      borderRadius: '50%'
                    }}
                    title={color.attributes.name}
                  />
                ))}
              </Space>
              <div className="price">
                Bs. {selectedFabric?.attributes?.wholesale_price || "N/A"}
                <span className="per-meter"> /metro</span>
              </div>
            </div>
          </Col>
          <Col lg={16} sm={24}>
            <div className="icon-tabs-container">
              <Tabs defaultActiveKey="meters" size="small" centered >
                <TabPane
                  tab={
                    <span>
                      <LineChartOutlined /> Metros
                    </span>
                  }
                  key="meters"
                >
                  <ColorSection colors={selectedFabric?.attributes?.colors} onColorSelect={handleColorSelect} />
                </TabPane>
                <TabPane
                  tab={
                    <span>
                      <RollbackOutlined /> Rollos
                    </span>
                  }
                  key="rolls"
                >
                  <RollsSection 
                    rolls={selectedFabric?.attributes?.rolls} 
                    onRollSelect={handleRollSelect}
                    selectedRolls={selectedRolls}
                  />
                </TabPane>
              </Tabs>
            </div>
          </Col>
        </Row>
      </Modal>
    </Row>
  );
};

export default FabricList;
