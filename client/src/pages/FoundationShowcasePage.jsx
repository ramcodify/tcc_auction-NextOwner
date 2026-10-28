import React, { useState } from 'react';
import { Search, Mail, ShieldAlert, Sparkles, Send, Check } from 'lucide-react';
import PageContainer from '../components/common/PageContainer.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import Dialog from '../components/common/Dialog.jsx';
import { Spinner, Skeleton, LoadingState } from '../components/common/LoadingState.jsx';

export const FoundationShowcasePage = () => {
  const [btnLoading, setBtnLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [testError, setTestError] = useState('');

  return (
    <PageContainer
      title="Component Library & Tokens"
      subtitle="Interactive catalog of all reusable components for NEXTowner, built in strict accordance with the restrained design system."
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDialogOpen(true)}
        >
          Open Dialog Modal
        </Button>
      }
    >
      <div className="space-y-12">
        {/* Buttons Section */}
        <section className="space-y-4">
          <div className="pb-2 border-b border-border">
            <h2 className="text-base font-semibold text-ink">Buttons</h2>
            <p className="text-xs text-olive">Variants, sizes, loading indicators, and restrained interaction states.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="danger">Danger Button</Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="md">Medium</Button>
            <Button variant="primary" size="lg">Large</Button>
            <Button variant="primary" icon={Send}>With Icon</Button>
            <Button
              variant="secondary"
              isLoading={btnLoading}
              onClick={() => {
                setBtnLoading(true);
                setTimeout(() => setBtnLoading(false), 1500);
              }}
            >
              {btnLoading ? 'Processing...' : 'Click to Test Loading'}
            </Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>
        </section>

        {/* Inputs Section */}
        <section className="space-y-4">
          <div className="pb-2 border-b border-border">
            <h2 className="text-base font-semibold text-ink">Inputs</h2>
            <p className="text-xs text-olive">Text inputs, search inputs, error messages, and disabled states.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Input
              label="Standard Text Input"
              placeholder="e.g. Student ID or Item Title"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              helperText="Helper description appears below the field."
            />

            <Input
              label="Search Field with Icon"
              placeholder="Search active auctions..."
              icon={Search}
            />

            <Input
              label="Validation Error State"
              placeholder="campus@university.edu"
              icon={Mail}
              error={testError || 'Please enter a valid .edu campus email'}
            />

            <Input
              label="Disabled Input"
              placeholder="Locked field"
              disabled
              helperText="This field is disabled."
            />
          </div>
        </section>

        {/* Badges Section */}
        <section className="space-y-4">
          <div className="pb-2 border-b border-border">
            <h2 className="text-base font-semibold text-ink">Badges</h2>
            <p className="text-xs text-olive">Used for auction statuses, category tags, and system indicators.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="default">Default Stone</Badge>
            <Badge variant="forest">Forest Active</Badge>
            <Badge variant="olive">Olive Secondary</Badge>
            <Badge variant="outline">Outline Neutral</Badge>
            <Badge variant="alert">Alert / Closed</Badge>
            <Badge variant="forest" size="sm">Small Tag</Badge>
          </div>
        </section>

        {/* Cards Section */}
        <section className="space-y-4">
          <div className="pb-2 border-b border-border">
            <h2 className="text-base font-semibold text-ink">Cards</h2>
            <p className="text-xs text-olive">Stone and Paper surfaces with subtle borders and clear sectioning.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="stone">
              <CardHeader>
                <CardTitle>Stone Surface Card</CardTitle>
                <CardDescription>Background #E8E5DB with thin border</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-ink leading-relaxed">
                  Stone is the primary surface color for listing containers, summary sidebars, and contextual blocks.
                </p>
              </CardContent>
              <CardFooter>
                <span className="text-xs text-olive">Footer text</span>
                <Badge variant="forest" size="sm">Verified</Badge>
              </CardFooter>
            </Card>

            <Card variant="paper">
              <CardHeader>
                <CardTitle>Paper Surface Card</CardTitle>
                <CardDescription>Background #F7F5F0 with subtle border</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-ink leading-relaxed">
                  Used for nested details, input groups, and secondary modal views that layer over stone backgrounds.
                </p>
              </CardContent>
              <CardFooter>
                <span className="text-xs text-olive">Footer info</span>
                <Button variant="outline" size="sm">Action</Button>
              </CardFooter>
            </Card>

            <Card variant="flat">
              <CardHeader>
                <CardTitle>Muted Detail Card</CardTitle>
                <CardDescription>Clean minimalist flat container</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-ink leading-relaxed">
                  Ideal for timestamps, rules, and seller instructions that need subtle separation without visual clutter.
                </p>
              </CardContent>
              <CardFooter>
                <span className="text-xs text-olive">Subtle footer</span>
                <Badge variant="olive" size="sm">Muted</Badge>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Loading States Section */}
        <section className="space-y-4">
          <div className="pb-2 border-b border-border">
            <h2 className="text-base font-semibold text-ink">Loading States</h2>
            <p className="text-xs text-olive">Clean spinners and restrained skeleton placeholders (no neon, no glows).</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="stone">
              <CardHeader>
                <CardTitle>Spinners</CardTitle>
                <CardDescription>Small, medium, and large</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-6 py-4">
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
              </CardContent>
            </Card>

            <Card variant="stone">
              <CardHeader>
                <CardTitle>Skeleton Loaders</CardTitle>
                <CardDescription>Simulated content loading</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 py-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </CardContent>
            </Card>

            <Card variant="stone">
              <CardHeader>
                <CardTitle>Container Loading</CardTitle>
                <CardDescription>Centered feedback block</CardDescription>
              </CardHeader>
              <CardContent>
                <LoadingState
                  message="Fetching auctions..."
                  description="Connecting to campus node"
                />
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      {/* Modal Dialog */}
      <Dialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Sample Dialog Modal"
        description="This modal tests keyboard listeners, backdrops, and button interactions."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={() => setDialogOpen(false)}>
              Confirm
            </Button>
          </>
        }
      >
        <p className="text-xs text-ink leading-relaxed">
          The dialog properly isolates focus, supports Escape key dismissal, and closes when clicking outside the modal box.
        </p>
      </Dialog>
    </PageContainer>
  );
};

export default FoundationShowcasePage;
