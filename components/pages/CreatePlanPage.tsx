import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { X } from "lucide-react";
import Image from "next/image";
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
    <div className="pt-[10vh] text-black">
      <div className="bg-white p-4 rounded-t-3xl min-h-[90vh]">
        <div className="flex justify-end">
          <button
            type="button"
            aria-label="Close"
            className="p-2 rounded-full hover:bg-gray-100 transition"
            onClick={() => setCurrentTab(null)}
          >
            <X className="w-4 h-4 text-black" />
          </button>
        </div>
        {/* Name */}
        <div className="mb-1">
          <Label htmlFor="plan-name" className="text-xs font-grotesk">
            Plan Name
          </Label>
          <Input id="plan-name" placeholder="Emergency Fund" />
        </div>

        {/* Amount */}
        <div className="mb-1">
          <Label htmlFor="plan-amount" className="text-xs font-grotesk">
            Plan Amount ($)
          </Label>
          <Input id="plan-amount" type="number" placeholder="1000" />
        </div>

        {/* Chain */}
        <div className="mb-1">
          <Label>Chain</Label>
          <Select value={config.chains[0].id.toString()}>
            <SelectTrigger className="rounded-xl">
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
        <div>
          <Label>Currency</Label>
          <Select value={getSupportedTokens("BASE")[0].address || ""}>
            <SelectTrigger className="rounded-xl">
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
        <div></div>
      </div>
    </div>
  );
}
