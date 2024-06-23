import Header from "@/components/Header";
import Login from "@/components/Login";
import { useAddress } from "@thirdweb-dev/react";
import { useEffect, useState } from "react";
import PropagateLoader from "react-spinners/PropagateLoader";
import { createThirdwebClient, getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { readContract } from "thirdweb";
import { ethers } from "ethers";
import { currency } from "../../constants";
import Countdown from "react-countdown"
import toast from "react-hot-toast"
import Marquee from "react-fast-marquee"
import { StarIcon, CurrencyDollarIcon, ArrowPathIcon, ArrowUturnDownIcon } from "@heroicons/react/24/solid";



export default function Home() {
  // create the client with your clientId, or secretKey if in a server environment
  const client = createThirdwebClient({
    clientId: "cba31e01547f9144a16829432dc8492c",
  });

  // connect to your contract
  const contract = getContract({
    client,
    chain: defineChain(80002),
    address: "0x38a65E941988a761Cb44C0D11c60e2FA3825e484",
  });

  const address = useAddress();

  // const {contract, isLoading}=useContract(
  //   process.env.NEXT_PUBLIC_LOTTERY_CONTRACT_ADDRESS
  // )

  const [quantity, setQuantity] = useState<number>(1);
  const [remainingTickets, setRemainingTickets] = useState<number | null>(null);
  const [currentWinningReward, setCurrentWinningReward] = useState<
    string | null
  >(null);
  const [ticketPrice, setTicketPrice] = useState<string | null>(null);
  const [ticketCommission, setTicketCommision] = useState<string | null>(null);
  const [expiration, setExpiration] = useState<string | null>(null);
  const [lastWinner, setLastWinner] = useState<string | null>(null);
  const [lastWinnerAmount, setLastWinnerAmount] = useState<string | null>(null);
  const [lotteryOperator, setLotteryOperator] = useState<string | null>(null);
  const [operatorTotalCommission, setOperatorTotalCommission] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userTickets, setUserTickets]=useState(0);
  const [winnings, setWinnings]=useState(0);
  

  type Props={
    hours:number;
    minutes: number;
    seconds: number;
    completed: boolean;
  }

  const renderer=({hours, minutes, seconds, completed}: Props)=>{
    if(completed){
      return(
        <div>
          <h2 className="text-white text-xl text-center animate-bounce">Ticket Sales have now CLOSED for this draw</h2>
          <div className="flex space-x-6">
            <div className="flex-1">
              <div className="countdown">{hours}</div>
              <div className="countdown-label">hours</div>
            </div>
            <div className="flex-1">
              <div className="countdown">{minutes}</div>
              <div className="countdown-label">minutes</div>
            </div>
            <div className="flex-1">
              <div className="countdown">{seconds}</div>
              <div className="countdown-label">seconds</div>
            </div>
          </div>
        </div>
      )
    }else{
      return(
        <div>
          <h3 className="text-white text-sm mb-2 italic">Time Remaining</h3>
          <div className="flex space-x-6">
            <div className="flex-1">
              <div className="countdown">{hours}</div>
              <div className="countdown-label">hours</div>
            </div>
            <div className="flex-1">
              <div className="countdown">{minutes}</div>
              <div className="countdown-label">minutes</div>
            </div>
            <div className="flex-1">
              <div className="countdown">{seconds}</div>
              <div className="countdown-label">seconds</div>
            </div>
          </div>
        </div>
      )
    }
  }


  const fetchData = async () => {
    setIsLoading(true);
    try {

      const operatorTotalCommission = await readContract({ 
        contract, 
        method: "function operatorTotalCommission() view returns (uint256)", 
        params: [] 
      })

      const lotteryOperator = await readContract({ 
        contract, 
        method: "function lotteryOperator() view returns (address)", 
        params: [] 
      })

      const lastWinner = await readContract({ 
        contract, 
        method: "function lastWinner() view returns (address)", 
        params: [] 
      })

      const lastWinnerAmount = await readContract({ 
        contract, 
        method: "function lastWinnerAmount() view returns (uint256)", 
        params: [] 
      })

      const winner = await readContract({ 
        contract, 
        method: "function getWinningsForAddress(address addr) view returns (uint256)", 
        // @ts-ignore 
        params: [address] 
      })

      const tickets = await readContract({ 
        contract, 
        method: "function getTickets() view returns (address[])", 
        params: [] 
      })
      // @ts-ignore 
      const totalTickets: string[]=tickets;

      const noOfUserTickets=totalTickets.reduce(
        (total, ticketAddress)=>(ticketAddress==address? total+1:total), 0
      )

      const expiration = await readContract({
        contract,
        method: "function expiration() view returns (uint256)",
        params: [],
      });

      const ticketCommission = await readContract({
        contract,
        method: "function ticketCommission() view returns (uint256)",
        params: [],
      });

      const ticketPric = await readContract({
        contract,
        method: "function ticketPrice() view returns (uint256)",
        params: [],
      });
      const winning = await readContract({
        contract,
        method: "function CurrentWinningReward() view returns (uint256)",
        params: [],
      });
      const remtickets = await readContract({
        contract,
        method: "function RemainingTickets() view returns (uint256)",
        params: [],
      });
      setRemainingTickets(Number(remtickets));
      setCurrentWinningReward(String(winning));
      setTicketPrice(String(ticketPric));
      setTicketCommision(String(ticketCommission));
      setExpiration(String(expiration));
      setUserTickets(Number(noOfUserTickets))
      setWinnings(Number(winner));
      setLastWinner(String(lastWinner))
      setLastWinnerAmount(String(lastWinnerAmount))
      setLotteryOperator(lotteryOperator)
      setOperatorTotalCommission(String(operatorTotalCommission))
    } catch (error) {
      console.error("Error fetching remaining tickets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when the component mounts
  useEffect(() => {
    fetchData();
  }, []);



  
  const handleClick = async () => {
    if (!ticketPrice) return;
  
    const notification = toast.loading("Buying tickets...");
  
    try {
      const totalCostInEther = (Number(ethers.utils.formatEther(ticketPrice)) * quantity).toString();
      const valueInWei = ethers.utils.parseEther(totalCostInEther);
  
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
  
      // Define the contract interface
      const contractABI = ["function BuyTickets() payable"];
      const contractWithSigner = new ethers.Contract(contract.address, contractABI, signer);
  
      // Set a fixed gas limit (adjust as needed)
      const fixedGasLimit = ethers.BigNumber.from(300000); // Example value, adjust as needed
  
      const txResponse = await contractWithSigner.BuyTickets({ 
        value: valueInWei, 
        gasLimit: fixedGasLimit 
      });
  
      const txReceipt = await txResponse.wait(); // Wait for the transaction to be mined
  
      toast.success("Tickets purchased successfully!", { id: notification });
      console.log("Transaction Hash:", txReceipt.transactionHash);
    } catch (err) {
      // Improved error handling
      // @ts-ignore 
      if (err.code === -32603 || err.message.includes("execution reverted")) {
        toast.error("Network Busy. Transaction reverted. Please retry.", { id: notification });
      } else {
        toast.error("Whoops, something went wrong!", { id: notification });
      }
      console.error("Contract call failure", err);
    } finally {
      fetchData(); // Refresh data after the transaction
    }
  };
  


  const withdrawWinnings = async () => {
    const notification = toast.loading("Withdrawing winnings...");
  
    try {
      // Ensure the user is connected and has an address
      if (!address) {
        throw new Error("No connected account found.");
      }
  
      // Prepare the contract call
      const transaction = await prepareContractCall({
        contract,
        method: "function WithdrawWinnings()",
        params: []
      });
  
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
  
      // Define the contract ABI
      const contractABI = [
        "function WithdrawWinnings()"
      ];
  
      // Create contract instance with signer
      const contractWithSigner = new ethers.Contract(contract.address, contractABI, signer);
  
      // Manually set a higher gas limit (e.g., 5x the estimated gas limit)
      const estimatedGasLimit = await contractWithSigner.estimateGas.WithdrawWinnings();
      const gasLimit = ethers.BigNumber.from(300000);// Increase the gas limit by 5 times
  
      // Send the transaction with the higher gas limit
      const txResponse = await contractWithSigner.WithdrawWinnings({ gasLimit });
  
      // Wait for the transaction to be mined
      const txReceipt = await txResponse.wait();
  
      toast.success("Winnings withdrawn successfully!", { id: notification });
      console.log("Transaction Hash:", txReceipt.transactionHash);
    } catch (err) {
      // Improved error handling
      // @ts-ignore 
      if (err.code === -32603 || err.message.includes("execution reverted")) {
        toast.error("Network Busy. Transaction reverted. Please Retry.", { id: notification });
      } else {
        toast.error("Whoops, something went wrong!", { id: notification });
      }
      console.error("Contract call failure", err);
    } finally {
      fetchData();
    }
  };

  // const drawWinner = async () => {
  //   const notification = toast.loading("Drawing the winner...");
  
  //   try {
  //     // Prepare the contract call for drawing the winner ticket
  //     const transaction = await prepareContractCall({ 
  //       contract, 
  //       method: "function DrawWinnerTicket()", 
  //       params: [] 
  //     });
  
  //     // Send the transaction
  //     const { transactionHash } = await sendTransaction({ 
  //       transaction, 
  //       account: address 
  //     });
  
  //     // Wait for the transaction to be mined
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     const receipt = await provider.waitForTransaction(transactionHash);
  
  //     // Notify success
  //     toast.success("Winner drawn successfully!", { id: notification });
  //     console.log("Transaction Hash:", receipt.transactionHash);
  //   } catch (err) {
  //     // Improved error handling
  //     if (err.code === -32603 || err.message.includes("execution reverted")) {
  //       toast.error("Network Busy. Transaction reverted. Please Retry.", { id: notification });
  //     } else {
  //       toast.error("Whoops, something went wrong!", { id: notification });
  //     }
  //     console.error("Contract call failure", err);
  //   } finally {
  //     fetchData(); // Refresh the data after the transaction
  //   }
  // };
  
  const drawWinner = async () => {
    const notification = toast.loading("Drawing the winner...");
  
    try {
      // Prepare the provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
  
      // Define the contract ABI for the DrawWinnerTicket function
      const contractABI = [
        "function DrawWinnerTicket()"
      ];
  
      // Get the contract instance with signer
      const contractWithSigner = new ethers.Contract(contract.address, contractABI, signer);
  
      // Manually setting a higher gas limit
      const gasLimit = 300000; // Adjust this value as needed
  
      // Send the transaction with the specified gas limit
      const txResponse = await contractWithSigner.DrawWinnerTicket({ gasLimit });
  
      // Wait for the transaction to be mined
      const receipt = await txResponse.wait();
  
      // Notify success
      toast.success("Winner drawn successfully!", { id: notification });
      console.log("Transaction Hash:", receipt.transactionHash);
    } catch (err) {
      // Improved error handling
      // @ts-ignore 
      if (err.code === -32603 || err.message.includes("execution reverted")) {
        toast.error("Network Busy. Transaction reverted. Please Retry.", { id: notification });
      } else {
        toast.error("Whoops, something went wrong!", { id: notification });
      }
      console.error("Contract call failure", err);
    } finally {
      fetchData(); // Refresh the data after the transaction
    }
  };
  

  const onRestartDraw = async () => {
    const notification = toast.loading("Restarting the draw...");
  
    try {
      // Prepare the provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
  
      // Define the contract ABI for the restartDraw function
      const contractABI = [
        "function restartDraw()"
      ];
  
      // Get the contract instance with signer
      const contractWithSigner = new ethers.Contract(contract.address, contractABI, signer);
  
      // Manually setting a higher gas limit
      const gasLimit = 300000; // Adjust this value as needed
  
      // Send the transaction with the specified gas limit
      const txResponse = await contractWithSigner.restartDraw({ gasLimit });
  
      // Wait for the transaction to be mined
      const receipt = await txResponse.wait();
  
      // Notify success
      toast.success("Draw restarted successfully!", { id: notification });
      console.log("Transaction Hash:", receipt.transactionHash);
    } catch (err) {
      // Improved error handling
      // @ts-ignore 
      if (err.code === -32603 || err.message.includes("execution reverted")) {
        toast.error("Network Busy. Transaction reverted. Please Retry.", { id: notification });
      } else {
        toast.error("Whoops, something went wrong!", { id: notification });
      }
      console.error("Contract call failure", err);
    } finally {
      fetchData(); // Refresh the data after the transaction
    }
  };
  
  const onRefundAll = async () => {
    const notification = toast.loading("Refunding all tickets...");
  
    try {
      // Prepare the provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
  
      // Define the contract ABI for the RefundAll function
      const contractABI = [
        "function RefundAll()"
      ];
  
      // Get the contract instance with signer
      const contractWithSigner = new ethers.Contract(contract.address, contractABI, signer);
  
      // Manually setting a higher gas limit
      const gasLimit = 300000; // Adjust this value as needed
  
      // Send the transaction with the specified gas limit
      const txResponse = await contractWithSigner.RefundAll({ gasLimit });
  
      // Wait for the transaction to be mined
      const receipt = await txResponse.wait();
  
      // Notify success
      toast.success("All tickets refunded successfully!", { id: notification });
      console.log("Transaction Hash:", receipt.transactionHash);
    } catch (err) {
      // Improved error handling
      // @ts-ignore 
      if (err.code === -32603 || err.message.includes("execution reverted")) {
        toast.error("Network Busy. Transaction reverted. Please Retry.", { id: notification });
      } else {
        toast.error("Whoops, something went wrong!", { id: notification });
      }
      console.error("Contract call failure", err);
    } finally {
      fetchData(); // Refresh the data after the transaction
    }
  };

  const onWithdrawCommission = async () => {
    const notification = toast.loading("Withdrawing commission...");
  
    try {
      // Prepare the provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
  
      // Define the contract ABI for the WithdrawCommission function
      const contractABI = [
        "function WithdrawCommission()"
      ];
  
      // Get the contract instance with signer
      const contractWithSigner = new ethers.Contract(contract.address, contractABI, signer);
  
      // Manually setting a higher gas limit
      const gasLimit = 300000; // Adjust this value as needed
  
      // Send the transaction with the specified gas limit
      const txResponse = await contractWithSigner.WithdrawCommission({ gasLimit });
  
      // Wait for the transaction to be mined
      const receipt = await txResponse.wait();
  
      // Notify success
      toast.success("Commission withdrawn successfully!", { id: notification });
      console.log("Transaction Hash:", receipt.transactionHash);
    } catch (err) {
      // Improved error handling
      // @ts-ignore 
      if (err.code === -32603 || err.message.includes("execution reverted")) {
        toast.error("Network Busy. Transaction reverted. Please Retry.", { id: notification });
      } else {
        toast.error("Whoops, something went wrong!", { id: notification });
      }
      console.error("Contract call failure", err);
    } finally {
      fetchData(); // Refresh the data after the transaction
    }
  };
  
  
  

  if (isLoading)
    return (
      <div className="bg-[#091B18] h-screen flex flex-col items-center justify-center">
        <div className="flex items-center space-x-2 mb-10">
          <img
            className="rounded-full h-20 w-20"
            src="https://static.displate.com/brand/layout/82c9846f-d928-45ff-a95e-0ab53d87f4e4/avatarStandard.jpg"
            alt=""
          />
          <h1 className="text-lg text-white font-bold">
            Loading the JACKPOT JUNCTION
          </h1>
        </div>
        <PropagateLoader color="white" size={30} />
      </div>
    );

  if (!address) return <Login />;

  return (
    <div className="bg-[#091B18] min-h-screen flex flex-col">
      <Header />
      <Marquee className="bg-[#0A1F1C] p-5 mb-5" gradient={false} speed={100}>
        <div className="flex space-x-2 mx-10">
          <h4 className="text-white font-bold mr-4">Last Winner: {lastWinner}</h4>
          <h4 className="text-white font-bold">Previous Winnings: {lastWinnerAmount && ethers.utils.formatEther(lastWinnerAmount?.toString())}{" "}{currency}</h4>
        </div>
      </Marquee>

      {lotteryOperator===address && (
        <div className="flex justify-center">
            <div className="text-white text-center px-3 py-3 rounded-md border-emerald-300/20 border">
              <h2 className="font-bold">Admin Controls</h2>
              <p className="mb-5">Total Commision to be withdrawn: {operatorTotalCommission && ethers.utils.formatEther(operatorTotalCommission?.toString())}{" "}{currency}</p>
              <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                <button onClick={drawWinner} className="admin-button">
                  <StarIcon className="h-6 mx-auto mb-2"/>
                  Draw Winner</button>
                <button onClick={onWithdrawCommission} className="admin-button">
                  <CurrencyDollarIcon className="h-6 mx-auto mb-2" />
                  Withdraw Commision</button>
                <button onClick={onRestartDraw} className="admin-button">
                  <ArrowPathIcon className="h-6 mx-auto mb-2" />
                  Restart Draw</button>
                <button onClick={onRefundAll} className="admin-button">
                  <ArrowUturnDownIcon className="h-6 mx-auto mb-2" />
                  Refund All</button>
              </div>
            </div>
        </div>
      )}

      {winnings>0 && (
        <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto mt-5" >
          <button onClick={withdrawWinnings} className="p-5 bg-gradient-to-b from-orange-500 to bg-emerald-600 animate-pulse text-center rounded-xl w-full">
            <p className="font-bold">Winner Winner Chicken Dinner</p>
            <p>
              Total Winnings: {ethers.utils.formatEther(winnings.toString())}{" "}{currency}
            </p>
            <br />
            <p className="font-semibold">Click here to withdraw your winnings</p>
          </button>
        </div>
      )}
      <div className="space-y-5 md:space-y-0 m-5 md:flex md:flex-row items-start justify-center md:space-x-5">
        <div className="stats-container">
          <h1 className="text-5xl text-white font-semibold text-center">
            The Next Draw
          </h1>

          <div className="flex justify-between p-2 space-x-2">
            <div className="stats">
              <h2 className="text-sm">Total Pool</h2>
              <p className="text-xl">
                {currentWinningReward &&
                  ethers.utils.formatEther(
                    currentWinningReward.toString()
                  )}{" "}
                {currency}
              </p>
            </div>
            <div className="stats">
              <h2 className="text-sm">Tickets Remaining</h2>
              <p className="text-xl">{Number(remainingTickets)}</p>
            </div>
          </div>
          <div className="mt-5 mb-3">
                  {expiration && <Countdown date={new Date(Number(expiration)*1000)} renderer={renderer} />}
          </div>
        </div>

        <div className="stats-container space-y-2">
          <div className="stats-container">
            <div className="flex justify-between items-center text-white pb-2">
              <h2>Price per ticket</h2>
              <p>
                {ticketPrice &&
                  ethers.utils.formatEther(ticketPrice.toString())}{" "}
                {currency}
              </p>
            </div>

            <div className="flex text-white items-center space-x-2 bg-[#091B18] border-[#004337] border p-4">
              <p>TICKETS</p>
              <input
                className="flex w-full bg-transparent text-right outline-none"
                type="number"
                min={1}
                max={10}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2 mt-5">
              <div className="flex items-center justify-between text-emerald-300 text-sm italic font-extrabold">
                <p>Total cost of tickets</p>
                <p>
                  {ticketPrice &&
                    Number(ethers.utils.formatEther(ticketPrice.toString())) *
                      quantity}{" "}
                  {currency}
                </p>
              </div>
              <div className="flex items-center justify-between text-emerald-300 text-xs italic">
                <p>Service fees</p>
                <p>
                  {ticketCommission &&
                    ethers.utils.formatEther(ticketCommission.toString())}{" "}
                  {currency}
                </p>
              </div>
              <div className="flex items-center justify-between text-emerald-300 text-xs italic">
                <p> + Network Fees</p>
                <p>TBC</p>
              </div>
            </div>

            <button disabled={!address || (expiration && expiration<Date.now().toString() )|| remainingTickets ===0} onClick={handleClick} className="mt-5 w-full bg-gradient-to-br from-orange-500 to-emerald-600 px-10 py-5 rounded-md text-white shadow-xl disabled:from-gray-600 disabled:text-gray-100 disabled:to-gray-600 disabled:cursor-not-allowed font-semibold">
              Buy {quantity} Ticket/s
            </button>
          </div>

          {userTickets>0 && (
            <div className="stats">
              <p className="text-lg mb-2">You have {userTickets} Tickets in this draw</p>

              <div className="flex min-w-full flex-wrap gap-x-2 gap-y-2">
                {Array(userTickets).fill("").map((_, index)=>(
                  <p key={index} className="text-emerald-300 h-20 w-12 bg-emerald-500/30 rounded-lg flex flex-shrink-0 items-center justify-center text-xs italic">{index+1}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="h-[175px]"></div>
      
      <footer className="border-t border-emerald-500/20 flex flex-col items-center text-center text-white p-5">
    <p className="text-sm text-emerald-100 mb-4">
      Jackpot Junction is a Crypto Lottery WebApp made using Next.JS by Nevil Jobanputra @2024
    </p>
    <p className="text-sm text-emerald-100">
      Please be patient while buying tickets and withdrawing winnings. As this is a testnet, you might require to retry multiple times for the transaction to proceed.
    </p>
  </footer>
    </div>
  );
}
