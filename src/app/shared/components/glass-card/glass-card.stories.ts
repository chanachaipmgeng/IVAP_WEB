import { Meta, StoryObj } from '@storybook/angular';
import { GlassCardComponent } from './glass-card.component';

const meta: Meta<GlassCardComponent> = {
    title: 'Shared/GlassCard',
    component: GlassCardComponent,
    tags: ['autodocs'],
    argTypes: {
        padding: {
            control: 'select',
            options: ['none', 'sm', 'md', 'lg'],
        },
        customClass: { control: 'text' },
    },
    parameters: {
        backgrounds: {
            default: 'dark',
        }
    }
};

export default meta;
type Story = StoryObj<GlassCardComponent>;

export const Default: Story = {
    args: {
        padding: 'md',
    },
    render: (args) => ({
        props: args,
        template: `
      <div style="background: url('assets/bg-gradient.jpg'); padding: 2rem; min-height: 300px;">
        <app-glass-card [padding]="padding">
          <h2 class="text-xl font-bold text-white mb-2">Glass Card Title</h2>
          <p class="text-gray-300">
            This is a glass card component showing the frosted glass effect. 
            It adapts to the background behind it.
          </p>
        </app-glass-card>
      </div>
    `,
    }),
};

export const NoPadding: Story = {
    args: {
        padding: 'none',
    },
    render: (args) => ({
        props: args,
        template: `
      <div style="background: #1a1a2e; padding: 2rem; height: 100%;">
        <app-glass-card [padding]="padding" customClass="overflow-hidden">
          <img src="https://picsum.photos/400/200" alt="Cover" class="w-full h-48 object-cover"/>
          <div class="p-4">
            <h3 class="text-white font-bold">Card with Image</h3>
            <p class="text-gray-400 text-sm">Padding applied internally to content area only.</p>
          </div>
        </app-glass-card>
      </div>
    `,
    }),
};
