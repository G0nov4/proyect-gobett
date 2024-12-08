import type { Schema, Attribute } from '@strapi/strapi';

export interface DetailSalesDetail extends Schema.Component {
  collectionName: 'components_detail_sales_details';
  info: {
    displayName: 'Sales-detail';
    icon: 'bulletList';
    description: '';
  };
  attributes: {
    fabric: Attribute.Relation<
      'detail.sales-detail',
      'oneToOne',
      'api::fabric.fabric'
    >;
    unit_price: Attribute.Decimal;
    quantity_meterage: Attribute.Decimal;
    sales_unit: Attribute.Enumeration<['POR METRO', 'POR ROLLO']>;
    color: Attribute.Relation<
      'detail.sales-detail',
      'oneToOne',
      'api::color.color'
    >;
    roll_code: Attribute.String;
    cuts: Attribute.Integer;
  };
}

export interface DetailTransferDetail extends Schema.Component {
  collectionName: 'components_detail_transfer_details';
  info: {
    displayName: 'transfer_detail';
  };
  attributes: {
    roll: Attribute.Relation<
      'detail.transfer-detail',
      'oneToOne',
      'api::roll.roll'
    >;
    notes: Attribute.String;
    quantity: Attribute.Decimal;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'detail.sales-detail': DetailSalesDetail;
      'detail.transfer-detail': DetailTransferDetail;
    }
  }
}
