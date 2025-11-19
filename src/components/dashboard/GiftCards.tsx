import { useState, useMemo } from "react";
import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { useToast } from "~/components/ui/use-toast";
import {
  Loader2,
  Plus,
  RefreshCw,
  CreditCard,
  DollarSign,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  type GiftCard,
  type GiftCardTransaction,
  type User,
} from "@prisma/client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";

type GiftCardWithRelations = GiftCard & {
  user: User | null;
  transactions: GiftCardTransaction[];
};

export default function GiftCards() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"code" | "email">("code");
  const { toast } = useToast();

  const {
    data: searchResults,
    isFetching: isSearching,
    refetch: search,
  } = api.giftCard.get.useQuery(
    { [searchType]: searchQuery },
    { enabled: false, retry: false },
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    void search();
  };

  console.log("searchResults", searchResults);

  return (
    <div className="flex h-full w-full max-w-4xl flex-col gap-6 overflow-y-auto p-6">
      <div className="flex items-center justify-end">
        <CreateGiftCardDialog onSuccess={() => search()} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Gift Cards</CardTitle>
          <CardDescription>
            Search by card code or customer email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <div className="flex flex-1 flex-col gap-2 sm:flex-row">
              <Select
                value={searchType}
                onValueChange={(value) =>
                  setSearchType(value as "code" | "email")
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="code">Card Code</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder={
                  searchType === "code"
                    ? "Enter card code..."
                    : "Enter email address..."
                }
                type={searchType === "email" ? "email" : "text"}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isSearching || !searchQuery}>
              {isSearching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {searchResults?.map((card) => (
          <GiftCardItem key={card.id} card={card} onUpdate={() => search()} />
        ))}
        {searchResults && searchResults.length === 0 && (
          <div className="col-span-full py-10 text-center text-muted-foreground">
            No gift cards found.
          </div>
        )}
      </div>

      <RecentPurchasesList />
    </div>
  );
}

function RecentPurchasesList() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: transactions } = api.giftCard.getRecentPurchases.useQuery(
    { limit: 50 },
    { enabled: isOpen },
  );

  const groupedTransactions = useMemo(() => {
    if (!transactions) return {};

    const groups: Record<string, typeof transactions> = {};

    transactions.forEach((tx) => {
      const dateKey = format(tx.createdAt, "yyyy-MM-dd");
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(tx);
    });

    return groups;
  }, [transactions]);

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Recent Purchases & Reloads</CardTitle>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CardDescription className="pb-4">
            View recent gift card activations and reloads, grouped by day.
          </CardDescription>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            {!transactions ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : Object.keys(groupedTransactions).length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                No recent transactions found.
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedTransactions)
                  .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
                  .map(([date, txs]) => (
                    <div key={date} className="space-y-2">
                      <h3 className="text-sm font-semibold text-muted-foreground">
                        {format(parseISO(date), "EEEE, MMMM do, yyyy")}
                      </h3>
                      <div className="rounded-md border">
                        {txs.map((tx) => (
                          <div
                            key={tx.id}
                            className="flex items-center justify-between border-b p-3 last:border-0"
                          >
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-medium">
                                  {tx.giftCard.code}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  • {format(tx.createdAt, "h:mm a")}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {tx.type === "MANUAL_ADJUSTMENT"
                                  ? "New Card"
                                  : "Reload"}{" "}
                                {tx.giftCard.user?.email &&
                                  `• ${tx.giftCard.user.email}`}
                              </div>
                            </div>
                            <div className="font-medium text-green-600">
                              +${(tx.amount / 100).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

function GiftCardItem({
  card,
  onUpdate,
}: {
  card: GiftCardWithRelations;
  onUpdate: () => void;
}) {
  return (
    <Card className={`sm:w-96 ${card.isReplaced ? "bg-muted opacity-60" : ""}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="font-mono text-xl tracking-wider">
              {card.code}
            </CardTitle>
            <CardDescription>
              {card.user ? card.user.email : "Unregistered"}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              ${(card.balance / 100).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">Balance</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="mb-4 text-sm text-muted-foreground">
          {card.isReplaced ? (
            <span className="font-semibold text-destructive">REPLACED</span>
          ) : (
            <span className="font-semibold text-green-600">ACTIVE</span>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium">Recent Transactions</p>
          {card.transactions?.slice(0, 3).map((tx) => (
            <div key={tx.id} className="flex justify-between text-xs">
              <span>{tx.type.replace("_", " ")}</span>
              <span
                className={tx.amount > 0 ? "text-green-600" : "text-red-600"}
              >
                {tx.amount > 0 ? "+" : ""}${(tx.amount / 100).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 pt-2 sm:justify-between">
        {!card.isReplaced && (
          <>
            <AddFundsDialog
              cardId={card.id}
              currentBalance={card.balance}
              onSuccess={onUpdate}
            />
            <ChargeDialog
              cardId={card.id}
              currentBalance={card.balance}
              onSuccess={onUpdate}
            />
            <ReplaceCardDialog card={card} onSuccess={onUpdate} />
          </>
        )}
      </CardFooter>
    </Card>
  );
}

function CreateGiftCardDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("");
  const { toast } = useToast();

  const createMutation = api.giftCard.create.useMutation({
    onSuccess: () => {
      toast({ title: "Gift card created successfully" });
      setOpen(false);
      setCode("");
      setAmount("");
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error creating gift card",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const balance = parseFloat(amount) * 100; // Convert to cents
    createMutation.mutate({ code, initialBalance: balance });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Gift Card
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Gift Card</DialogTitle>
          <DialogDescription>
            Enter the code from the back of the card and the initial balance.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Card Code</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="baseFlex !justify-between gap-2">
              <Label htmlFor="amount">Initial Amount ($)</Label>

              <p className="text-sm text-muted-foreground">
                (Min $5.00 - Max $500.00)
              </p>
            </div>

            <Input
              id="amount"
              type="number"
              step="0.01"
              min="5"
              max="500"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <DialogFooter className="p-2">
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Card
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddFundsDialog({
  cardId,
  currentBalance,
  onSuccess,
}: {
  cardId: string;
  currentBalance: number;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const { toast } = useToast();

  const addFundsMutation = api.giftCard.addFunds.useMutation({
    onSuccess: () => {
      toast({ title: "Funds added successfully" });
      setOpen(false);
      setAmount("");
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error adding funds",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount) * 100;
    addFundsMutation.mutate({ id: cardId, amount: value });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <DollarSign className="mr-2 h-3 w-3" />
          Add Funds
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Funds</DialogTitle>
          <DialogDescription>
            Current Balance: ${(currentBalance / 100).toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="baseFlex !justify-between gap-2">
              <Label htmlFor="add-amount">Amount to Add ($)</Label>

              <p className="text-sm text-muted-foreground">
                (Min $5.00 - Max $500.00)
              </p>
            </div>
            <Input
              id="add-amount"
              type="number"
              step="0.01"
              min="5"
              max="500"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <DialogFooter className="p-2">
            <Button type="submit" disabled={addFundsMutation.isPending}>
              {addFundsMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Funds
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ChargeDialog({
  cardId,
  currentBalance,
  onSuccess,
}: {
  cardId: string;
  currentBalance: number;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const { toast } = useToast();

  const chargeMutation = api.giftCard.charge.useMutation({
    onSuccess: () => {
      toast({ title: "Card charged successfully" });
      setOpen(false);
      setAmount("");
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error charging card",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amount) * 100;
    chargeMutation.mutate({ id: cardId, amount: value });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <CreditCard className="mr-2 h-3 w-3" />
          Charge
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Charge Gift Card</DialogTitle>
          <DialogDescription>
            Current Balance: ${(currentBalance / 100).toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="charge-amount">Amount to Charge ($)</Label>
            <Input
              id="charge-amount"
              type="number"
              step="0.01"
              min="0.01"
              inputMode="decimal"
              max={(currentBalance / 100).toFixed(2)}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <DialogFooter className="p-2">
            <Button
              type="submit"
              variant="destructive"
              disabled={chargeMutation.isPending}
            >
              {chargeMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Charge Card
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ReplaceCardDialog({
  card,
  onSuccess,
}: {
  card: GiftCardWithRelations;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const { toast } = useToast();

  const replaceMutation = api.giftCard.replace.useMutation({
    onSuccess: () => {
      toast({ title: "Card replaced successfully" });
      setOpen(false);
      setNewCode("");
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error replacing card",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    replaceMutation.mutate({ oldCardId: card.id, newCardCode: newCode });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RefreshCw className="mr-2 h-3 w-3" />
          Replace
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Replace Lost/Stolen Card</DialogTitle>
          <DialogDescription>
            This will transfer the balance of ${(card.balance / 100).toFixed(2)}{" "}
            to a new card and deactivate the old one ({card.code}).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-code">New Card Code</Label>
            <Input
              id="new-code"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              required
              placeholder="Type new card code"
            />
          </div>
          <DialogFooter className="p-2">
            <Button type="submit" disabled={replaceMutation.isPending}>
              {replaceMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Transfer Balance & Replace
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
