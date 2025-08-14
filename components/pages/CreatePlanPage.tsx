import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { ArrowRight, ArrowUpRight, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

import { config } from "@/components/providers/WagmiProvider";
import { getSupportedTokens } from "@/lib/tokenUtils";
import { Calendar } from "@/components/ui/calendar";
import { parseDate } from "chrono-node";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function CreatePlanPage({
  setCurrentTab,
}: {
  setCurrentTab: (tab: any) => void;
}) {
  return (
    <>
      <style jsx>{`
        @keyframes slideUpFromBottom {
          0% {
            opacity: 0;
            transform: translateY(100%);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .slide-up {
          animation: slideUpFromBottom 0.4s ease-out;
        }
      `}</style>
      <div className="pt-[10vh] text-black">
        <div className="bg-white/20 backdrop-blur-md border border-white/30 p-4 rounded-t-3xl min-h-[90vh] shadow-2xl slide-up">
        <div className="flex justify-end">
          <button
            type="button"
            aria-label="Close"
            className="p-2 rounded-full hover:bg-white/20 backdrop-blur-sm border border-white/30 transition-all duration-200"
            onClick={() => setCurrentTab("home")}
          >
            <X className="w-4 h-4 text-gray-800" />
          </button>
        </div>
        {/* Name */}
        <div className="mb-1">
          <Label htmlFor="plan-name" className="text-xs font-grotesk text-gray-800">
            Plan Name
          </Label>
          <Input id="plan-name" placeholder="Emergency Fund" className="bg-white/30 backdrop-blur-sm border-white/40" />
        </div>

        {/* Amount */}
        <div className="mb-1">
          <Label htmlFor="plan-amount" className="text-xs font-grotesk text-gray-800">
            Plan Amount ($)
          </Label>
          <Input id="plan-amount" type="number" placeholder="1000" className="bg-white/30 backdrop-blur-sm border-white/40" />
        </div>

        {/* Chain */}
        <div className="mb-1">
          <Label className="text-gray-800">Chain</Label>
          <Select value={config.chains[0].id.toString()}>
            <SelectTrigger className="rounded-xl bg-white/30 backdrop-blur-sm border-white/40">
              <SelectValue placeholder="Select network" />
            </SelectTrigger>
            <SelectContent>
              {config.chains.map((chain) => (
                <SelectItem key={chain.id} value={chain.id.toString()}>
                  {chain.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* currency */}
        <div className="mb-1">
          <Label className="text-gray-800">Currency</Label>
          <Select value={getSupportedTokens("BASE")[0].address || ""}>
            <SelectTrigger className="rounded-xl bg-white/30 backdrop-blur-sm border-white/40">
              <SelectValue placeholder="Select token" />
            </SelectTrigger>
            <SelectContent>
              {getSupportedTokens("BASE").map((token) => (
                <SelectItem key={token.address} value={token.address || ""}>
                  <div className="flex items-center space-x-2">
                    {token.image && (
                      <Image
                        src={`/${token.image}`}
                        alt={token.name}
                        width={16}
                        height={16}
                        className="rounded-full"
                      />
                    )}
                    <span>{token.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Maturity time */}
        <div className="mb-1">
          <Label className="text-xs font-grotesk text-gray-800">Maturity Time</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between rounded-xl bg-white/30 backdrop-blur-sm border-white/40 hover:bg-white/40"
              >
                <span className="text-gray-700">
                  {format(new Date(), "MMM dd, yyyy")}
                </span>
                <CalendarIcon className="w-4 h-4 text-gray-700" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={new Date()}
                onSelect={(date) => {
                  if (date) {
                    // Handle date selection
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Penalty fee */}
        <div className="mb-1">
          <Label htmlFor="penalty-fee" className="text-xs font-grotesk text-gray-800">
            Penalty Fee (%)
          </Label>
          <Input id="penalty-fee" type="number" placeholder="5" className="bg-white/30 backdrop-blur-sm border-white/40" />
        </div>

        {/* Action - next, cancel */}
        <div className="flex flex-col gap-2 justify-center space-x-2 mt-16">
          <Button onClick={() => {}} className="bg-orange-500/80 backdrop-blur-sm border border-orange-400/50 hover:bg-orange-600/80">
            Next <ArrowRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" className="border-none bg-white/20 backdrop-blur-sm hover:bg-white/30 text-gray-800" onClick={() => setCurrentTab("home")}>
            Cancel
          </Button>
        </div>
      </div>
      </div>
    </>
  );
}
