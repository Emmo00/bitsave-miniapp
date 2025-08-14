import { ChevronDown, Plus, TrendingUp, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "../ui/button";

// vaults = "saving plans"
//

type Props = {
  setCurrentTab: (tab: any) => void;
};

export default function VaultsPage({ setCurrentTab }: Props) {
  return (
    <div className="pt-[10vh] text-black pb-32">
      <div className="bg-white/20 backdrop-blur-md border border-white/30 p-4 rounded-t-3xl min-h-[90vh] shadow-2xl slide-up">
        <div className="flex justify-between py-2 px-1">
          <h1 className="text-2xl font-bold">Savings Plans</h1>
          <button
            type="button"
            aria-label="Close"
            className="p-2 rounded-full hover:bg-white/20 backdrop-blur-sm border border-white/30 transition-all duration-200"
            onClick={() => setCurrentTab("home")}
          >
            <X className="w-4 h-4 text-gray-800" />
          </button>
        </div>

        {/* List */}
        <Card
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 mb-6 shadow-lg"
          style={{
            animation: "fadeInUp 0.3s ease-out 0.3s both",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-gray-800 font-medium mb-1">
                Apple MacBook Air
              </h3>
              <p className="text-[0.7rem]">created: 7/2/2022</p>
              <p className="text-gray-700 text-sm mt-2">$595</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-orange-100/80 backdrop-blur-sm rounded-lg flex items-center justify-center border border-orange-200/50">
                <div className="text-xs py-1 px-2">
                  <span>cUSD</span> on <span>CELO</span>
                </div>
              </div>
            </div>
          </div>
          <Progress
            value={42}
            className="h-4 bg-white/20 backdrop-blur-sm border border-white/30 bg-gradient-to-r from-weirdBlue to-weirdGreen"
          />
          <div className="flex justify-between pt-2">
            <span></span>
            <span className="text-xs text-green-600">Matures: 8/23/2025</span>
          </div>
          <div className="flex justify-between">
            <div></div>
            <div className=" justify-center items-center gap-2">
              <Button variant="outline" className="mt-4 mr-2">
                <ChevronDown className="" /> Withdraw
              </Button>
              <Button
                variant="outline"
                className="bg-gradient-to-r from-weirdGreen-80 to-weirdGreen text-white font-medium py-2 rounded-lg"
              >
                <Plus className="" /> Deposit
              </Button>
            </div>
          </div>
        </Card>

        <Card
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 mb-6 shadow-lg"
          style={{
            animation: "fadeInUp 0.3s ease-out 0.3s both",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-gray-800 font-medium mb-1">
                Apple MacBook Air
              </h3>
              <p className="text-[0.7rem]">created: 7/2/2022</p>
              <p className="text-gray-700 text-sm mt-2">$595</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-orange-100/80 backdrop-blur-sm rounded-lg flex items-center justify-center border border-orange-200/50">
                <div className="text-xs py-1 px-2">
                  <span>cUSD</span> on <span>CELO</span>
                </div>
              </div>
            </div>
          </div>
          <Progress
            value={42}
            className="h-4 bg-white/20 backdrop-blur-sm border border-white/30 bg-gradient-to-r from-weirdBlue to-weirdGreen"
          />
          <div className="flex justify-between pt-2">
            <span></span>
            <span className="text-xs text-green-600">Matures: 8/23/2025</span>
          </div>
          <div className="flex justify-between">
            <div></div>
            <div className=" justify-center items-center gap-2">
              <Button variant="outline" className="mt-4 mr-2">
                <ChevronDown className="" /> Withdraw
              </Button>
              <Button
                variant="outline"
                className="bg-gradient-to-r from-weirdGreen-80 to-weirdGreen text-white font-medium py-2 rounded-lg"
              >
                <Plus className="" /> Deposit
              </Button>
            </div>
          </div>
        </Card>

        <Card
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 mb-6 shadow-lg"
          style={{
            animation: "fadeInUp 0.3s ease-out 0.3s both",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-gray-800 font-medium mb-1">
                Apple MacBook Air
              </h3>
              <p className="text-[0.7rem]">created: 7/2/2022</p>
              <p className="text-gray-700 text-sm mt-2">$595</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-orange-100/80 backdrop-blur-sm rounded-lg flex items-center justify-center border border-orange-200/50">
                <div className="text-xs py-1 px-2">
                  <span>cUSD</span> on <span>CELO</span>
                </div>
              </div>
            </div>
          </div>
          <Progress
            value={42}
            className="h-4 bg-white/20 backdrop-blur-sm border border-white/30 bg-gradient-to-r from-weirdBlue to-weirdGreen"
          />
          <div className="flex justify-between pt-2">
            <span></span>
            <span className="text-xs text-green-600">Matures: 8/23/2025</span>
          </div>
          <div className="flex justify-between">
            <div></div>
            <div className=" justify-center items-center gap-2">
              <Button variant="outline" className="mt-4 mr-2">
                <ChevronDown className="" /> Withdraw
              </Button>
              <Button
                variant="outline"
                className="bg-gradient-to-r from-weirdGreen-80 to-weirdGreen text-white font-medium py-2 rounded-lg"
              >
                <Plus className="" /> Deposit
              </Button>
            </div>
          </div>
        </Card>

        <Card
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 mb-6 shadow-lg"
          style={{
            animation: "fadeInUp 0.3s ease-out 0.3s both",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-gray-800 font-medium mb-1">
                Apple MacBook Air
              </h3>
              <p className="text-[0.7rem]">created: 7/2/2022</p>
              <p className="text-gray-700 text-sm mt-2">$595</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-orange-100/80 backdrop-blur-sm rounded-lg flex items-center justify-center border border-orange-200/50">
                <div className="text-xs py-1 px-2">
                  <span>cUSD</span> on <span>CELO</span>
                </div>
              </div>
            </div>
          </div>
          <Progress
            value={42}
            className="h-4 bg-white/20 backdrop-blur-sm border border-white/30 bg-gradient-to-r from-weirdBlue to-weirdGreen"
          />
          <div className="flex justify-between pt-2">
            <span></span>
            <span className="text-xs text-green-600">Matures: 8/23/2025</span>
          </div>
          <div className="flex justify-between">
            <div></div>
            <div className=" justify-center items-center gap-2">
              <Button variant="outline" className="mt-4 mr-2">
                <ChevronDown className="" /> Withdraw
              </Button>
              <Button
                variant="outline"
                className="bg-gradient-to-r from-weirdGreen-80 to-weirdGreen text-white font-medium py-2 rounded-lg"
              >
                <Plus className="" /> Deposit
              </Button>
            </div>
          </div>
        </Card>

        <Card
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 mb-6 shadow-lg"
          style={{
            animation: "fadeInUp 0.3s ease-out 0.3s both",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-gray-800 font-medium mb-1">
                Apple MacBook Air
              </h3>
              <p className="text-[0.7rem]">created: 7/2/2022</p>
              <p className="text-gray-700 text-sm mt-2">$595</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-orange-100/80 backdrop-blur-sm rounded-lg flex items-center justify-center border border-orange-200/50">
                <div className="text-xs py-1 px-2">
                  <span>cUSD</span> on <span>CELO</span>
                </div>
              </div>
            </div>
          </div>
          <Progress
            value={42}
            className="h-4 bg-white/20 backdrop-blur-sm border border-white/30 bg-gradient-to-r from-weirdBlue to-weirdGreen"
          />
          <div className="flex justify-between pt-2">
            <span></span>
            <span className="text-xs text-green-600">Matures: 8/23/2025</span>
          </div>
          <div className="flex justify-between">
            <div></div>
            <div className=" justify-center items-center gap-2">
              <Button variant="outline" className="mt-4 mr-2">
                <ChevronDown className="" /> Withdraw
              </Button>
              <Button
                variant="outline"
                className="bg-gradient-to-r from-weirdGreen-80 to-weirdGreen text-white font-medium py-2 rounded-lg"
              >
                <Plus className="" /> Deposit
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
