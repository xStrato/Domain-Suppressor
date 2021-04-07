const MY_PROCESS_NAME: string = "my-custom-tag";

const YOU_CUSTOM_TAG: string = `[name='${MY_PROCESS_NAME}']`
const INJECT_CODE: string = `document.querySelector("${YOU_CUSTOM_TAG}")?.name`;
const BLOCK_URL: string = "https://www.google.com/";

chrome.cookies.set({
    name: "suppress_execution", 
    url: BLOCK_URL,
    value: "inactive"
})

chrome.tabs.onActivated.addListener(tab => 
{
    try 
    {
        chrome.cookies.get({
            name: "suppress_execution",
            url: BLOCK_URL
        }, (data) => suppressOnActivated(tab.tabId, data?.value))
    } 
    catch (error)
    {
        console.log(error);
    }
});


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => 
{
    try 
    {
        chrome.cookies.get({
            name: "suppress_execution", 
            url: BLOCK_URL}, 
            (data) => suppressOnUpdated(tab, data?.value))
    }
    catch (error) 
    {
        console.log(error);
    }
});

function suppressOnUpdated(tab:chrome.tabs.Tab, executionStatus?:string): void
{
    if (executionStatus==="active")
    {
        chrome.tabs.executeScript(tab.id!, { code: INJECT_CODE }, (executionResult) => 
        {
            if (!executionResult?.includes(MY_PROCESS_NAME) && tab.url?.includes(BLOCK_URL))
            {
                chrome.tabs.remove(tab.id!);
            }
        });
    }
}

function suppressOnActivated(tabId:number, executionStatus?:string): void
{
    if (executionStatus==="active")
    {
        chrome.tabs.executeScript(tabId, { code: INJECT_CODE }, (executionResult) => 
        {
            chrome.tabs.get(tabId, tabInfo => 
            {
                if (!executionResult?.includes(MY_PROCESS_NAME) && 
                    tabInfo.url?.includes(BLOCK_URL))
                {
                    setTimeout(() => chrome.tabs.remove(tabId), 500);
                } 
            });
        });
    }
}