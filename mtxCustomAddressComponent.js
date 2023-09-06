import { LightningElement, wire, api } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';

import COUNTRY_CODE from '@salesforce/schema/Account.BillingCountryCode';
import MAILING_STATE_CODE from '@salesforce/schema/Account.BillingStateCode';

export default class MtxCustomAddressComponent extends LightningElement {
    _countries = [];
    _countryToStates = {};

    selectedCountry;
    selectedState;

    @api city;
    @api street;
    @api country;
    @api province;
    @api postalCode;

    @api addressLabel;
    @api streetLabel;
    @api cityLabel;
    @api countryLabel;
    @api provinceLabel;
    @api postalCodeLabel;

    connectedCallback(){
        this.selectedCountry = this.country;
        if(this.addressLabel == ''){
            this.addressLabel = 'Address';
        }
        if(this.streetLabel == ''){
            this.streetLabel = 'Street';
        }
        if(this.cityLabel == ''){
            this.cityLabel = 'City';
        }
        if(this.countryLabel == ''){
            this.countryLabel = 'Country';
        }
        if(this.provinceLabel == ''){
            this.provinceLabel = 'Province';
        }
        if(this.postalCodeLabel == ''){
            this.postalCodeLabel = 'PostalCodeNew';
        }
    }

    @wire(getPicklistValues, {
        recordTypeId: '012000000000000AAA',
        fieldApiName: COUNTRY_CODE
    })
    wiredCountires({ data }) {
        this._countries = data?.values;
    }

    @wire(getPicklistValues, { recordTypeId: '012000000000000AAA', fieldApiName: MAILING_STATE_CODE })
    wiredStates({ data }) {
        if (!data) {
            return;
        }

        const validForNumberToCountry = Object.fromEntries(Object.entries(data.controllerValues).map(([key, value]) => [value, key]));
        this._countryToStates = data.values.reduce((accumulatedStates, state) => {
            const countryIsoCode = validForNumberToCountry[state.validFor[0]];

            return { ...accumulatedStates, [countryIsoCode]: [...(accumulatedStates?.[countryIsoCode] || []), state] };
        }, {});
    }

    get countries() {
        return this._countries;
    }

    get states() {
        return this._countryToStates[this.selectedCountry] || [];
    }

    handleAddresschange(event){
        this.city = event.detail.city;
        this.street = event.detail.street;
        this.country = event.detail.country;
        this.province = event.detail.province;
        this.postalCode = event.detail.postalCode;
        this.selectedCountry = event.detail.country;
        const addressEvent = new CustomEvent('addressvalue',{
            detail:{
                city:this.city,
                street:this.street,
                country:this.country,
                province:this.province,
                postalCode:this.postalCode,
            }
        });
        this.dispatchEvent(addressEvent);
    }
}