my_secret_value = process.env.MORPH_MONGO;

const axios = require('axios')
const fs = require('fs');
var lodash = require('lodash');
//var d3 = require('d3');


const db = require('monk')(my_secret_value)
const collection = db.get('database')




var start =  "2017-09-06T15:35:37.352273+03:00" 
var array = [];
var next = 0;
console.log(start)
function piv(){  
next++;


axios.get('https://public.api.openprocurement.org/api/2.3/contracts?offset='+start)
	.then(function (data) {	
		var dataset = data.data.data;
		start = data.data.next_page.offset;
		console.log(start)
		return dataset;
	})
	.then(function (dataset) {	
		dataset.forEach(function(get) {
			axios.get('https://public.api.openprocurement.org/api/2.3/contracts/'+get.id)
			.then(function (data) {	
				var get = data.data.data;
			
				var id =get.id;
				var contractID =get.contractID;
				var tender_id =get.tender_id;
				
				
				try {
					var dateModified =get.dateModified;
					var dateSigned =get.dateSigned;
					var buyer = get.procuringEntity.name;	
					var regionBuyer = get.procuringEntity.address.region;	
					var edrBuyer = get.procuringEntity.identifier.id;	
					var amount =get.value.amount;
					var edrSuppliers = get.suppliers[0].identifier.id;	
					var suppliers =  get.suppliers[0].name;	
					var regionSuppliers =  get.suppliers[0].address.region;	
					var contactPointSuppliers =  get.suppliers[0].contactPoint.email;
					var cpv = get.items[0].classification.id;
					var cpvDescription = get.items[0].classification.description;
					var price='';var units='';
					if(get.items){
						var items = get.items.length;
						var unit = get.items[0].unit.name;
						var quantity = get.items[0].quantity;
						for (var p = 0; p < get.items.length; p++) {
							try {
								price = get.items[p].unit.value.amount;
								units = get.items[p].unit.name;
							}catch (err) {}						
						}
					}
					else{
						var items = "";
						var unit = "";
						var quantity = "";
					}
				
					var descriptionAll= "";
					for (var it = 0; it < get.items.length; it++) {
						descriptionAll = get.items[it].description.toLowerCase()+"; "+descriptionAll
					}
								
					
					var changeLength=0;
					if(get.changes){
						for (var p = 0; p < get.changes.length; p++) {
							if(get.changes[p].rationaleTypes[0]=="itemPriceVariation"){
								changeLength++;
							}
						}
					}
				}catch (err) {}	
				
				
						
				
				
				
			
			
		
				var contract ={
					id:id,
					tender_id:tender_id,
					contractID:contractID,
					dateModified:dateModified,
					dateSigned:dateSigned,
					cpv:cpv,
					cpvDescription:cpvDescription,
					buyer:buyer,
					suppliers:suppliers,
					regionBuyer:regionBuyer,
					edrBuyer:edrBuyer,
					regionSuppliers:regionSuppliers,
					edrSuppliers:edrSuppliers,
					contactPointSuppliers:contactPointSuppliers,
					items:items,
					unit:unit,
					quantity:quantity,
					amount:amount,
					changeLength:changeLength,
					descriptionAll:descriptionAll,
					price:price,
					units:units,
				};

				//array.push(obj);
				//console.log(array)
				return contract;
				
			})
			.then(function (contract) {
				//console.log(contract.tender_id);
				
				axios.get('https://public.api.openprocurement.org/api/2.3/tenders/'+contract.tender_id)
				.then(function (data) {	
					var get = data.data.data;
					
				 
					
					
				try {
					var complaints=0,amcuStatus=0;
					if(!get.complaints){complaints = 0;amcuStatus=0}
						else {
							complaints = get.complaints.length;
							for (var i = 0; i < get.complaints.length; i++) {
								if(get.complaints[i].type=="complaint"){
									amcuStatus=amcuStatus+1;
									}		
								}
							}
						

					
					var bids_id=[];
					if(get.bids){
						var bids = get.bids.length;
						
						for (var b = 0; b < get.bids.length; b++) {
							try {
									bids_id.push(get.bids[b].tenderers[0].name)
								}
							catch (err) {
								//console.log("oops");
							}
						}	
					}else {var bids =0}
					var bids_uniq = lodash.uniq(bids_id).length;
					
					
					if(get.lots){
						var lots = get.lots.length;
						for (var c = 0; c < get.contracts.length; c++) {
							if(get.contracts[c].id==contract.id){
								var amountFromTender = get.contracts[c].value.amount;
								var relatedLot = get.contracts[c].items[0].relatedLot;
								
								for (var l = 0; l < get.lots.length; l++) {
									if(get.lots[l].id==relatedLot){var startAmount = get.lots[l].value.amount;}
								}
								
								
								
							}
						}	
					}else {var lots =1; var startAmount = get.value.amount;var amountFromTender = get.contracts[0].value.amount;}
					
					var lowerPrice=[];var disq='';
						for (var i = 0; i < get.awards.length; i++) {
							if(get.awards[i].lotID==relatedLot){
								lowerPrice.push(get.awards[i].value.amount);
								if(lowerPrice.length>1&&Math.max(...lowerPrice)==lowerPrice[lowerPrice.length-1])disq='y';
							}		
						}
					
					var questions=0;if(get.questions){questions = get.questions.length;}
				
					var bids=1;if(get.bids){bids = get.bids.length;}
					var awards=get.awards.length;
					
				}catch(err){}
					
					
					
					
						
					
					
					
		
					contract.save_=Math.round((startAmount-contract.amount)/startAmount*100);
					contract.save=Math.round((amountFromTender-contract.amount)/amountFromTender*100);
					contract.numberOfBids=get.numberOfBids;
					contract.bids_uniq=bids_uniq;
					contract.complaints=complaints;
					contract.amcuStatus=amcuStatus;
					contract.lots=lots;
					contract.bids=bids;
					contract.awards=awards;
					contract.questions=questions;
					contract.startAmount=startAmount;
					contract.procurementMethodType=get.procurementMethodType;
					contract.amountFromTender=amountFromTender;
					contract.tenderID=get.tenderID;
					contract.relatedLot=relatedLot;
					contract.owner=get.owner;
					contract.lowerPrice=lowerPrice;
					contract.disq=disq;
					
					return contract;
				})
				.then(function (contract) {	
					//console.log(contract)
					collection.insert(contract)
					
				})
				
			})
		})//dataset
		
	})
	.then(function () {	
		if (next<500){setTimeout(function() {piv ();},5000);}		
		else {setTimeout(function() {console.log("stop");db.close();},50000); }
	});
	
	}
	piv ();	

	
	
