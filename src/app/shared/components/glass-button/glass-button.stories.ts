import { Meta, StoryObj } from '@storybook/angular';
import { GlassButtonComponent } from './glass-button.component';

const meta: Meta<GlassButtonComponent> = {
    title: 'Shared/GlassButton',
    component: GlassButtonComponent,
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['primary', 'secondary', 'danger'],
        },
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg'],
        },
        disabled: { control: 'boolean' },
        loading: { control: 'boolean' },
        fullWidth: { control: 'boolean' },
        customClass: { control: 'text' },
    },
};

export default meta;
type Story = StoryObj<GlassButtonComponent>;

export const Primary: Story = {
    args: {
        variant: 'primary',
        size: 'md',
        loading: false,
        disabled: false,
        buttonClasses: '', // Internal getter, but maybe needed for template if not fully inferred
    },
    render: (args) => ({
        props: args,
        template: `<app-glass-button [variant]="variant" [size]="size" [loading]="loading" [disabled]="disabled" [fullWidth]="fullWidth">Primary Action</app-glass-button>`,
    }),
};

export const Secondary: Story = {
    args: {
        variant: 'secondary',
    },
    render: (args) => ({
        props: args,
        template: `<app-glass-button [variant]="variant" [size]="size">Secondary Action</app-glass-button>`,
    }),
};

export const Danger: Story = {
    args: {
        variant: 'danger',
    },
    render: (args) => ({
        props: args,
        template: `<app-glass-button [variant]="variant">Data Loss Action</app-glass-button>`,
    }),
};

export const Loading: Story = {
    args: {
        loading: true,
        variant: 'primary',
    },
    render: (args) => ({
        props: args,
        template: `<app-glass-button [loading]="loading" [variant]="variant">Processing...</app-glass-button>`,
    }),
};
