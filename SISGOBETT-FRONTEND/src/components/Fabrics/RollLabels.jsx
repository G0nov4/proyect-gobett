import React from 'react';
import { Typography, Space } from 'antd';
import './RollLabels.css';
import logo from '../../assets/Logo Gobett.png';

const { Text } = Typography;

function RollLabels({ fabric, rolls }) {
    const getRollNumber = (code) => {
        return code.split('-').pop();
    };

    return (
        <div className="labels-container">
            {rolls.map((roll) => (
                <div key={roll.id} className="roll-label">
                    <div className="label-header">
                        <img src={logo} alt="Logo" className="label-logo" />
                        <div className="roll-code">
                            {roll.attributes.code}
                        </div>
                    </div>

                    <table className="roll-info-table">
                        <tbody>
                            <tr>
                                <td className="label">Tela:</td>
                                <td className="value">{fabric.attributes.name}</td>
                            </tr>
                            <tr>
                                <td className="label">Color:</td>
                                <td className="value">
                                    <div className="color-info">
                                        <span>{roll.attributes.color.data.attributes.name}</span>
                                        <span className="color-code">
                                            (# {roll.attributes.color.data.attributes.code})
                                        </span>
                                        <div 
                                            className="color-sample"
                                            style={{ backgroundColor: roll.attributes.color.data.attributes.color }}
                                        />
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td className="label">Metraje:</td>
                                <td className="value">{roll.attributes.roll_footage} mts</td>
                            </tr>
                            <tr>
                                <td className="label">Nº Rollo:</td>
                                <td className="value highlight">{getRollNumber(roll.attributes.code)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
}

export default RollLabels; 