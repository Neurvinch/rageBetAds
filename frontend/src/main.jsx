import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'
import { WagmiProvider } from 'wagmi'
import { QueryClient,QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider ,darkTheme } from '@rainbow-me/rainbowkit'
import { http } from 'wagmi'
import { sepolia,monadTestnet  } from 'viem/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import "@rainbow-me/rainbowkit/styles.css"
import './index.css'
import App from './App.jsx'


const ProjectId = import.meta.env.VITE_PROJECT_ID;
 


const config = getDefaultConfig({
  appName : "Eduzy",
  projectId : "3f84877fb445dd3a1c6a2813dcfdb3d0",
  chains:[sepolia, monadTestnet],
  transports: {
    [sepolia.id] : http("https://worldchain-sepolia.g.alchemy.com/v2/Ljr9rV6foCZ6EDtKt6z-d2Kiy0ahFvLs"),
    [monadTestnet.id] : http("https://monad-testnet.g.alchemy.com/v2/bBA5Mnb4SmI254K3uqriS")

  }
})
  
const queryClient = new QueryClient()

const theme = darkTheme({
  accentColor: '#7b3fe4',
  accentColorForeground: "white",
  fontStack : "system",
  overlayBlur: "small",
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient} >
        <RainbowKitProvider theme={theme} chains={[sepolia, monadTestnet]}>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
    </StrictMode>
)