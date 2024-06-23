import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { createThirdwebClient, getContract, resolveMethod } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import {Toaster} from "react-hot-toast"
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'

// create the client with your clientId, or secretKey if in a server environment
export const client = createThirdwebClient({ 
  clientId: "cba31e01547f9144a16829432dc8492c" 
});

// connect to your contract
export const contract = getContract({ 
  client, 
  chain: defineChain(80002), 
  address: "0x38a65E941988a761Cb44C0D11c60e2FA3825e484"
});

const queryClient = new QueryClient()

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider>
      <QueryClientProvider client={queryClient} contextSharing={true}>
      <Component {...pageProps} />
      <Toaster />
      </QueryClientProvider>
    </ThirdwebProvider>
  )
}
