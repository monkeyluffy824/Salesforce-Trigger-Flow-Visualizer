document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("connectToOrgViaBackend").addEventListener("click", async () => {
		 chrome.cookies.getAll({ name: "sid" }, async (cookies) => {
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
		  console.log(JSON.stringify(ent));
		  if(ent.triggerable){
			 objects.push(ent.name);
		  }
		  
		  
	  }
	  console.log(objects);
	  
    } catch (e) {
      console.log(e.message);
    }
  });
  });
});

/*let salesforceInstance='';
let canConnectSalesforce=false;
let cookie= undefined;
let salesforcetabId=undefined;
async function getSalesforceSessionDetails(){
	let queryOptions={
		lastFocusedWindow: true,
		url: ["https://*.salesforce.com/*","https://*.force.com/*"]
		
	};
	await chrome.tabs.query(queryOptions,(tabs)=>{
		if(tabs.length>0){
			const tab= tabs[0];
			if(tab){
				const url = new URL(tab.url);
				salesforcetabId=tab.id;
				salesforceInstance= url.origin;
				getSalesforceCookies(salesforceInstance);
			}else{
				console.log("No salesforce login found");
			}
		}else{
			console.log("NO salesforce login found");
		}
	});
}
async function getSalesforceCookies(instanceUrl){
	const detailsObject={
		url: instanceUrl,
		name: "sid"
	};
	await chrome.cookies.getAll(detailsObject,(res)=>{
		if(res && res.length>0){
			cookie= res[0];
			canConnectSalesforce=true;
		}
	});
}

getSalesforceSessionDetails();
*/