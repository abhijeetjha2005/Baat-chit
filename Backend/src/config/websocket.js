const WebSocket=require('ws')


const setupWebSocket=(server)=>{

  const wss=new WebSocket.Server({server})

  console.log("webSocket Server Started");

  wss.on('connection',(ws)=>{
    console.log("New user connected");
    ws.on('message',(message)=>{
      try{
           const data =JSON.parse(message);
           wss.clients.forEach(client=>{
            if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
           })

      }catch(err){
        console.log("Invalid message");
        
      }
    })
    ws.on('close',()=>{
      console.log("User disconnected");
      
    })
    
  })
  
}

module.exports=setupWebSocket;