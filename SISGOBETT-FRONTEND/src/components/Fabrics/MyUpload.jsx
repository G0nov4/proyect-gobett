import { Col, Form, Upload, message, Image } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React, { useState, useCallback, useEffect } from 'react';
import { useDeleteImage } from '../../services/UploadImages';

const MyUpload = ({ fileList: initialFileList, setFileList }) => {
  const [processedFileList, setProcessedFileList] = useState([]);
  const [previewImage, setPreviewImage] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const deleteImagenMutation = useDeleteImage();
  const API_URL = 'http://localhost:1337';

  // Procesar archivos iniciales
  useEffect(() => {
    if (!initialFileList) return;

    try {
      // Convertir a formato para Upload
      const files = Array.isArray(initialFileList) ? initialFileList : [];
      const processed = files.map(file => ({
        uid: file.id,
        name: file.attributes?.name || '',
        status: 'done',
        url: `${API_URL}${file.attributes?.url}`,
        response: [{
          id: file.id,
          name: file.attributes?.name,
          url: file.attributes?.url
        }]
      }));

      setProcessedFileList(processed);
    } catch (error) {
      console.error('Error procesando archivos iniciales:', error);
      message.error('Error al cargar las imágenes existentes');
    }
  }, [initialFileList]);

  // Agregar validación básica
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Solo puedes subir archivos de imagen!');
      return false;
    }

    // Validar tamaño máximo (25MB)
    const isValidSize = file.size / 1024 / 1024 <= 25;
    if (!isValidSize) {
      message.error('La imagen debe ser menor a 25MB!');
      return false;
    }

    return true;
  };

  // Manejar la subida de archivos
  const customRequest = async ({ file, onSuccess, onError, onProgress }) => {
    const formData = new FormData();
    formData.append('files', file);

    try {
      const response = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('sisgbt-jwtoken')}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error en la subida');
      }

      const data = await response.json();
      const uploadedFile = data[0];

      // Formato para UI
      console.log('Antes de newFile:', uploadedFile);
      const newFile = {
        uid: uploadedFile.id,
        name: uploadedFile.name,
        status: 'done',
        url: `${API_URL}${uploadedFile.url}`,
        response: [uploadedFile]
      };
      console.log('Después de newFile:', newFile);

      // Actualizar estado local
      setProcessedFileList(prev => [...prev, newFile]);

      // Actualizar estado padre (formato para API)
      const apiFormat = {
        id: uploadedFile.id,
        attributes: {
          name: uploadedFile.name,
          url: uploadedFile.url,
          formats: uploadedFile.formats
        }
      };
      setFileList(prev => [...(prev || []), apiFormat]);


      onSuccess(data);
      message.success('Imagen subida exitosamente');
    } catch (error) {
      console.error('Error detallado:', error);
      onError(error);
      if (error.message.includes('413')) {
        message.error('La imagen es demasiado grande para el servidor');
      } else {
        message.error(`Error al subir la imagen: ${error.message}`);
        message.warning('Por favor revise que la imagen no esté corrupta');
      }
    }
  };

  // Manejar la eliminación de archivos
  const handleRemove = async file => {
    try {
      await deleteImagenMutation.mutateAsync(file.response[0].id);
      
      // Actualizar estado local
      setProcessedFileList(prev => 
        prev.filter(item => item.uid !== file.uid)
      );

      // Actualizar estado padre
      setFileList(prev => 
        prev.filter(item => item.id !== file.response[0].id)
      );

      message.success('Imagen eliminada exitosamente');
    } catch (error) {
      console.error('Error eliminando archivo:', error);
      message.error('Error al eliminar la imagen');
    }
  };

  // Manejar la previsualización
  const handlePreview = useCallback(file => {
    setPreviewImage(file.url);
    setPreviewOpen(true);
  }, []);

  return (
    <Col xs={24} md={12}>
      <div className='card-product'>
        <span className='title-card-name'>Imágenes del producto</span>
        <div>
          
            <Upload
              name="files"
              maxCount={8}
              multiple={true}
              listType="picture-card"
              fileList={processedFileList}
              customRequest={customRequest}
              beforeUpload={beforeUpload}
              onPreview={handlePreview}
              onRemove={handleRemove}
              accept="image/*"
              showUploadList={{
                showPreviewIcon: true,
                showRemoveIcon: true,
                showDownloadIcon: false
              }}
            >
              {processedFileList.length < 8 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Subir</div>
                </div>
              )}
            </Upload>
       
        </div>
      </div>
      {previewImage && (
        <Image
          preview={{
            visible: previewOpen,
            onVisibleChange: setPreviewOpen,
          }}
          src={previewImage}
          style={{ display: 'none' }}
        />
      )}
    </Col>
  );
};

export default MyUpload;
