  export default function  handlePost = async (post) => {
    setIsPosting(true);
    
    
    try {
      const fullAccount = localStorage.getItem("accountId");
      const accountId = fullAccount.split("/").pop();
      const payloadDetails = JSON.parse(localStorage.getItem("listingData"));

      const response = await fetch(
        "https://n8n.srv968758.hstgr.cloud/webhook/cc144420-81ab-43e6-8995-9367e92363b0",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            city: slug,
            account: accountId,
            bookUrl: payloadDetails?.website,
            output: post.aiOutput,
            description: post.description,
            cityName: payloadDetails?.locality,
            accessToken: session?.accessToken,
          }),
        }
      );

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();

      // const data = 200;

      // if(data === 200){
      //   console.log("rrrrrrr");
        
      //   handleUpdateStatus("posted")
      // }
      
      
      // Hide posting loader
      setIsPosting(false);
      
      // Show success animation
      setShowSuccess(true);
      
    } catch (error) {
      setIsPosting(false);
      showToast("Failed to send post", "error");
    }
  };