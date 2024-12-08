import React from 'react';
import { Modal } from 'antd';
import { BranchForm } from '../Branches/Forms'


const ModalCreateBranch = ({ open, onCancel,updateTable, data }) => {
   

    return (
        <Modal
            open={open}
            destroyOnClose={true}
            centered
            onCancel={onCancel}
            width={700}
            closable={true}
            footer={false}
        >
            <BranchForm onCancel={onCancel} updateTable={updateTable} data={data}/>
        </Modal>
    );
};

export default ModalCreateBranch;