import Controller from "./Controller";
import Pagamento from "../api/Pagamento";
import Session from '../api/Session';
import { getCookie } from  '../api/util';
import CryptoHelper from '../models/CryptoHelper';

class DataLayer extends Controller{
    constructor(){
        super();
        window.dataLayer = window.dataLayer || [];
    }

    start(){
      this.load();
    }

    async load(){
         //Session/Basic dataLayer
         window.dataLayer.push({
            "sessionID" : await Session.getToken(),
            "zanpid": getCookie("zanpid"),
            "utm_source": getCookie("utm_source"),
            "utm_content": getCookie("utm_content"),
            "utm_campaign": getCookie("utm_campaign"),
            "utm_term": getCookie("utm_term"),
            "utm_medium": getCookie("utm_medium"),
            "midia": getCookie("midia")
        });

        //User dataLayer
        await this.userDataLayer();

        //Cart dataLayer
        await this.cartDataLayer();
        
        //Payment dataLayer
        await this.paymentDataLayer();

        //Refund dataLayer
        await this.refundDataLayer();

        window.dataLayer.push({
            'dataLayerLoaded': true,
            'event': 'gtm.dom'
        });
    }

    async userDataLayer(){
        try{
            this.user = await Session.getUser();
            if(this.user){
                window.dataLayer.push({
                    'userID': this.user.Codigo,
                    'emailSHA256':  CryptoHelper.sha256(this.user.Email),
                    'emailMD5':  CryptoHelper.md5(this.user.Email)
                });
            }
            return true;
        }catch(ex){
            return false;
        }
    }

    async cartDataLayer(){
        try{
            var Cart = this.component("Cart");
            if(Cart){
                await this.component("MiniCart").join();
                window.dataLayer.push({
                    "totalAmount" : Cart.cart().TotalValor.format("0.00"),
                    "currency": "BRL",
                    "products": Cart.cart().Itens ? Cart.cart().Itens.map((i)=>{
                        return {
                            'sku': `${i.CodigoGrupo}|${i.Numero}`,// SKU/code.
                            'price': ((i.ValorCota * i.Teimosinha * i.Cotas) - i.ValorDesconto).format("0.00"),    // Unit price.
                            'quantity': i.Cotas,
                            'currency': 'BRL',
                            'lottery': i.NomeGrupo.substring(0, 2)
                        }
                    }) : []
                });
            }
            return true;
        }catch(ex){
            return false;
        }
    }
    async paymentDataLayer(){
        try{
            var Payment = this.component("FinalizarPagamento");
            if(Payment){
                var gaTransaction = await Pagamento.getGATransaction(Payment.paymentInfo.Payment.PaymentID, 1);
                    
                //Data Layer generico para todas as transações de checkout
                window.dataLayer.push({
                    "transactionID": gaTransaction.action.id,
                    "totalAmount": gaTransaction.action.revenue,
                    "shipping": gaTransaction.action.shipping,
                    "tax": gaTransaction.action.tax,
                    "affiliation": gaTransaction.action.affiliation,
                    "currency": "BRL",
                    "products": gaTransaction.products.map((item)=>{
                        return {
                            'id': gaTransaction.action.id,      // Transaction ID. Required.
                            'name': item.name,        // Product name. Required.
                            'sku': item.sku,      // SKU/code.
                            'category': item.category,         // Category or variation.
                            'price': item.price,    // Unit price.
                            'quantity': item.quantity,         // Quantity.
                            'currency': 'BRL',           // local currency code.
                            'lottery': item.lottery
                        }
                    }) 
                });
                //dataLayer especifico para Google Analytics Universal
                window.dataLayer.push({
                    'ecommerce': {
                        'purchase': {
                            'actionField': {
                                'id': gaTransaction.action.id,                         // Transaction ID. Required for purchases and refunds.
                                'affiliation': gaTransaction.action.affiliation,
                                'revenue': gaTransaction.action.revenue,                     // Total transaction value (incl. tax and shipping)
                                'tax': gaTransaction.action.tax,
                                'shipping': gaTransaction.action.shipping,
                                'currency': gaTransaction.action.currency           // local currency code.
                            },
                            'products': gaTransaction.products.map((item)=>{
                                return {
                                    'id': item.sku,      // Transaction ID. Required.
                                    'name': item.name,        // Product name. Required.
                                    'category': item.category,         // Category or variation.
                                    'price': item.price,    // Unit price.
                                    'quantity': item.quantity,         // Quantity.
                                    'currency': 'BRL',           // local currency code.                            
                                }
                            }) 
                        }
                    }
                });
            }
            return true;
        }catch(ex){
            return false;
        }
    }

    async refundDataLayer(){
        try{
            var Payment = this.component("FinalizarPagamento");
            if(Payment){
                var refunds = await Pagamento.getRefundGaTransactions();
                
                refunds.forEach(refund => {
                    window.dataLayer.push({
                        'ecommerce': {
                            'refund': {
                                'actionField': {
                                    'id': refund.action.id                         // Transaction ID. Required for purchases and refunds.
                                }
                            }
                        }
                    });
                });
            }
            return true;
        }catch(ex){
            return false;
        }
    }

}
export default DataLayer;