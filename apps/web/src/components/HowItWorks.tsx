import { Search, Camera, MessageCircle, Package, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Browse & Search',
    description: 'Find toys by age, brand, category, or location. Use filters to narrow down your search.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: MessageCircle,
    title: 'Chat with Seller',
    description: 'Message sellers directly, ask questions, negotiate prices, and arrange pickup or delivery.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: Package,
    title: 'Secure Payment',
    description: 'Pay securely using UPI, cards, or wallets. Your money is protected until delivery.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: CheckCircle,
    title: 'Get Delivered',
    description: 'Receive your toy at your doorstep. Inspect and confirm. Rate your experience.',
    color: 'bg-orange-100 text-orange-600',
  },
];

const sellerSteps = [
  {
    icon: Camera,
    title: 'List Your Toy',
    description: 'Take photos, add details, and set your price. Our AI suggests the best price.',
    color: 'bg-pink-100 text-pink-600',
  },
  {
    icon: MessageCircle,
    title: 'Connect with Buyers',
    description: 'Chat with interested buyers, answer questions, and finalize the deal.',
    color: 'bg-cyan-100 text-cyan-600',
  },
  {
    icon: Package,
    title: 'Ship or Handover',
    description: 'Pack the toy safely. Ship it or arrange local pickup with the buyer.',
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    icon: CheckCircle,
    title: 'Get Paid',
    description: 'Receive payment instantly via UPI or bank transfer once buyer confirms.',
    color: 'bg-red-100 text-red-600',
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Simple, safe, and secure way to buy and sell kids toys
          </p>
        </div>

        {/* For Buyers */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">For Buyers</h3>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Step Number */}
                  <div className="absolute -top-2 -left-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full ${step.color}`}
                  >
                    <step.icon className="h-8 w-8" />
                  </div>

                  {/* Content */}
                  <div>
                    <h4 className="font-semibold mb-2">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* For Sellers */}
        <div>
          <h3 className="text-2xl font-bold text-center mb-8">For Sellers</h3>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {sellerSteps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Step Number */}
                  <div className="absolute -top-2 -left-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full ${step.color}`}
                  >
                    <step.icon className="h-8 w-8" />
                  </div>

                  {/* Content */}
                  <div>
                    <h4 className="font-semibold mb-2">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {index < sellerSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
