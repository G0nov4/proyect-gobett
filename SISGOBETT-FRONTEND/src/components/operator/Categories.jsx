import React, { useState } from 'react';
import { Card, Col, Divider, Row, Skeleton, Space } from 'antd';
import { useCategories } from '../../services/Categories';
import { DotChartOutlined, AppstoreOutlined } from '@ant-design/icons';
import './Categories.css'; // Import your custom styles

const Categories = ({ onCategorySelect }) => {
    const { data: categories, isError, isLoading } = useCategories('id', 'asc', {
       filters: {
        visible: {
                $eq: true
            }
        }
    });
    const [selectedCategory, setSelectedCategory] = useState(null);

    const handleClickCard = (category) => {
        const newSelection = category.id === selectedCategory ? null : category.id;
        setSelectedCategory(newSelection);
        onCategorySelect(newSelection);
    };

    // Función para manejar el botón "Todos"
    const handleAllCategories = () => {
        setSelectedCategory(null);
        onCategorySelect(null);
    };

    if (isError) {
        return <div>Error al cargar las categorías</div>;
    }

    if (isLoading) {
        return (
            <Space style={{ margin: '0px 0px 10px 0px' }}>
                <Skeleton.Button active={true} size='small' shape='default' block />
                <Skeleton.Button active={true} size='small' shape='default' block />
                <Skeleton.Button active={true} size='small' shape='default' block />
            </Space>
        );
    }

    return (
        <Row>
            <Col span={24}>
                <h4 style={{ margin: '0px 0px 5px 0px' }}>Categorias de telas</h4>
                <Divider style={{ margin: '0px 0px 10px 0px' }} />
                <Space className="custom-space">
                    {/* Botón "Todos" */}
                    <div
                        hoverable
                        className={`custom-card ${selectedCategory === null ? 'selected' : ''}`}
                        style={{
                            borderTop: `2px solid ${selectedCategory === null ? '--selected-color' : ''}`,
                            '--selected-color': selectedCategory === null ? '--selected-color' : '',
                            margin: '0px 0px 10px 0px',
                            height: '30px',
                            padding: '5px 10px 2px 10px',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                        onClick={handleAllCategories}
                    >
                        <AppstoreOutlined />
                    </div>
                    {categories?.map((category) => {
                        const isSelected = category.id === selectedCategory;
                        return (
                            <div
                                hoverable
                                className={`custom-card ${isSelected ? 'selected' : ''}`}
                                style={{
                                    borderTop: `2px solid ${category.attributes.color_categorie}`,
                                    '--selected-color': category.attributes.color_categorie,
                                    margin: '0px 0px 10px 0px',
                                    height: '30px',
                                    padding: '5px 10px 2px 10px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                                onClick={() => handleClickCard(category)}
                            >
                                <b>{category.attributes.name}</b>
                            </div>
                        );
                    })}
                </Space>
            </Col>
        </Row>
    );
};

export default Categories;
