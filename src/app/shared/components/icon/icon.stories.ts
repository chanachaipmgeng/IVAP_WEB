import { Meta, StoryObj } from '@storybook/angular';
import { IconComponent } from './icon.component';

const meta: Meta<IconComponent> = {
    title: 'Shared/Icon',
    component: IconComponent,
    tags: ['autodocs'],
    argTypes: {
        name: {
            control: 'text',
            description: 'Icon name (e.g., menu, search, close)',
        },
        size: {
            control: 'number',
        },
        strokeWidth: {
            control: 'number',
        },
        customClass: {
            control: 'text',
        },
    },
};

export default meta;
type Story = StoryObj<IconComponent>;

export const Default: Story = {
    args: {
        name: 'alert-triangle',
        size: 24,
        strokeWidth: 2,
        customClass: 'text-red-500',
    },
};

export const Devices: Story = {
    args: {
        name: 'devices',
        size: 32,
        customClass: 'text-blue-400',
    },
};

export const RefreshSpin: Story = {
    args: {
        name: 'refresh',
        size: 24,
        customClass: 'text-green-400 animate-spin',
    },
};
