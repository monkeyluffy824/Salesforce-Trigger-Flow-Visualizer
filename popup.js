document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("connectToOrgViaBackend").addEventListener("click", async () => {
	     if(!salesforceDomain){
			 alert("No Active salesforce login found, please login to your org.");
		 }else{
			 salesforceDomain=salesforceDomain.replace("lightning.force.com","my.salesforce.com");
		 console.log(salesforceDomain);
		 chrome.cookies.getAll({ name: "sid", domain: salesforceDomain}, async (cookies) => {
		const sidCookie = cookies.find(c => c.domain.includes("my.salesforce.com"));
		if (!sidCookie) {
		  return;
		}

		const sid = sidCookie.value;
		const instanceUrl = `https://${sidCookie.domain.replace(/^\./, "")}`;

		try {
		  const res = await fetch(`${instanceUrl}/services/data/v64.0/sobjects/`, {
			headers: {
			  "Authorization": "Bearer " + sid,
			  "Content-Type": "application/json"
			}
		  });
		  const body = await res.json();
		  let sObjects=  body["sobjects"];
		  let objects=[];
		  for(const ind in sObjects){
			  let ent= sObjects[ind];
			  if(ent.triggerable){
				 objects.push(ent.label);
			  }
			  
			  
		  }
		  objectsList=objects;
		  console.log(objectsList);
		  let container = document.querySelector('.alert-toast');
		  let alertSuccess = container.querySelector(`sl-alert[variant="success"]`);
		  let alertError = container.querySelector(`sl-alert[variant="warning"]`);
		  if(objectsList.length>0){
			  const menuCheck= document.getElementById("sObjectSelection");
			  if(menuCheck){
				  menuCheck.innerHTML='';
			  }
			  displaySObjects();
			  alertSuccess.toast();
			  
		  }else{
			  alertError.toast();
		  }
		  
		} catch (e) {
		  console.log('error occured', e);
		}
	  });
		 }
	     
  });
  
  document.getElementById("urlMenu").addEventListener("sl-change", (event)=>{
	  const selectedVal= event.target.value;
	  console.log(selectedVal,"from menu");
	  const tab= selectedVal;
	  if(tab){
		    const ur = new URL(tab);
		    salesforceDomain= ur.hostname;
			console.log(salesforceDomain);
			const  buttonElement= document.getElementById('connectToOrgViaBackend');
			buttonElement.disabled=false;
	   }
  });
  
});

let salesforceDomain='';
let objectsList=undefined;
let displayList = undefined;
let selectedSObject=undefined;
async function getSalesforceSessionDetails(){
	let queryOptions={
		lastFocusedWindow: true,
		url: ["https://*.salesforce.com/*","https://*.force.com/*"]
		
	};
	await chrome.tabs.query(queryOptions,(tabs)=>{
		const  buttonElement= document.getElementById('connectToOrgViaBackend');
		buttonElement.disabled=true;
		console.log(tabs);
		if(tabs.length>0){
			const urlMenu= document.getElementById('urlMenu');
			for(let k in tabs){
				const opt = document.createElement('sl-option');
				opt.value= tabs[k].url;
				opt.textContent = tabs[k].url;
				urlMenu.appendChild(opt);
			}
			
		}else{
			console.log("NO salesforce login found");
		}
	});
}


getSalesforceSessionDetails();


function displaySObjects(){
	if(objectsList){
		const displaySection= document.getElementById("sObjectSelection");
		const searchControlsDiv = document.createElement("div");
		const searchInput = document.createElement('sl-input');
		const heading = document.createElement('h3');
		heading.textContent="SObjectList:";
		displaySection.appendChild(heading);
		searchInput.placeholder="Type Object Label and press ENTER";
		searchInput.size="medium";
		searchInput.type="text"
		searchInput.id="SerachSObjects";
		searchInput.addEventListener("sl-change", (event)=>{
			console.log('serach bar value', event.target.value);
			let searchInput=event.target.value;
			displayList=objectsList.filter(item=>{
				if(item.includes(searchInput)){
					return item;
				}
			});
			const menu= document.getElementById('SObjectMenuTable');
			creationOfMenuItems(menu);
			
		});
		searchControlsDiv.appendChild(searchInput);
		displaySection.appendChild(searchControlsDiv);
		displayList=objectsList;
		const menu= document.createElement("sl-menu");
		menu.classList.add("table");
		menu.id="SObjectMenuTable";
		creationOfMenuItems(menu);
		console.log(menu);
		displaySection.appendChild(menu);
	}
}


function creationOfMenuItems(menuElement){
	menuElement.replaceChildren();
	for( let k in displayList){
		const menuItem= document.createElement('sl-menu-item');
		menuItem.textContent=displayList[k];
		menuItem.value=displayList[k];
		menuItem.label=displayList[k];
		menuElement.appendChild(menuItem);
	}
	
	menuElement.addEventListener('sl-select',(event)=>{
		selectedSObject=event.detail.item.label;
		console.log(selectedSObject);
	});
	
}


