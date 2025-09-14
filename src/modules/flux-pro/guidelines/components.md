# Flux UI Pro - Premium Component Guidelines

*Based on Laravel Boost methodology - Premium UI component library for Livewire applications*

## Flux UI Pro Overview

Flux UI Pro is the premium edition of the Flux component library, providing access to all free components plus advanced premium components. Built for professional applications requiring sophisticated UI elements and enhanced functionality.

### Core Features
- **Complete component library** - All free components + premium additions
- **Advanced interactions** - Complex components like calendars, charts, editors
- **Professional design** - Enterprise-grade UI components
- **Enhanced functionality** - Advanced features not available in free tier

### Available Components (Pro + Free)

**Premium Components (Pro Only):**
- **accordion** - Collapsible content sections
- **autocomplete** - Advanced search inputs with suggestions
- **calendar** - Date picker and calendar interfaces
- **card** - Enhanced card layouts
- **chart** - Data visualization components
- **command** - Command palette interfaces
- **context** - Context menu components
- **date-picker** - Advanced date selection
- **editor** - Rich text editor component
- **pagination** - Advanced pagination controls
- **popover** - Floating content containers
- **table** - Data table with sorting/filtering
- **tabs** - Tabbed interface components
- **toast** - Notification toasts

**Free Components (Included):**
- avatar, badge, brand, breadcrumbs, button, callout, checkbox, dropdown, field, heading, icon, input, modal, navbar, profile, radio, select, separator, switch, text, textarea, tooltip

## Premium Component Usage

### Advanced Data Components

#### Data Tables
```blade
<flux:table>
    <flux:table.header>
        <flux:table.row>
            <flux:table.cell>Name</flux:table.cell>
            <flux:table.cell>Email</flux:table.cell>
            <flux:table.cell>Role</flux:table.cell>
            <flux:table.cell>Actions</flux:table.cell>
        </flux:table.row>
    </flux:table.header>

    <flux:table.body>
        @foreach($users as $user)
            <flux:table.row>
                <flux:table.cell>{{ $user->name }}</flux:table.cell>
                <flux:table.cell>{{ $user->email }}</flux:table.cell>
                <flux:table.cell>
                    <flux:badge variant="success">{{ $user->role }}</flux:badge>
                </flux:table.cell>
                <flux:table.cell>
                    <flux:button size="sm" wire:click="editUser({{ $user->id }})">
                        Edit
                    </flux:button>
                </flux:table.cell>
            </flux:table.row>
        @endforeach
    </flux:table.body>
</flux:table>
```

#### Sortable/Filterable Table
```blade
<flux:table sortable filterable>
    <flux:table.header>
        <flux:table.cell sort-key="name">Name</flux:table.cell>
        <flux:table.cell sort-key="email">Email</flux:table.cell>
        <flux:table.cell sort-key="created_at">Created</flux:table.cell>
    </flux:table.header>

    <flux:table.body>
        @foreach($sortedUsers as $user)
            <flux:table.row>
                <flux:table.cell>{{ $user->name }}</flux:table.cell>
                <flux:table.cell>{{ $user->email }}</flux:table.cell>
                <flux:table.cell>{{ $user->created_at->format('M j, Y') }}</flux:table.cell>
            </flux:table.row>
        @endforeach
    </flux:table.body>
</flux:table>
```

### Interactive Components

#### Accordion
```blade
<flux:accordion>
    <flux:accordion.item>
        <flux:accordion.trigger>
            Account Settings
        </flux:accordion.trigger>
        <flux:accordion.content>
            <div class="space-y-4">
                <flux:field>
                    <flux:label>Display Name</flux:label>
                    <flux:input wire:model="profile.name" />
                </flux:field>

                <flux:field>
                    <flux:label>Email</flux:label>
                    <flux:input wire:model="profile.email" type="email" />
                </flux:field>
            </div>
        </flux:accordion.content>
    </flux:accordion.item>

    <flux:accordion.item>
        <flux:accordion.trigger>
            Privacy Settings
        </flux:accordion.trigger>
        <flux:accordion.content>
            <div class="space-y-3">
                <flux:switch wire:model="privacy.public_profile">
                    Public profile
                </flux:switch>

                <flux:switch wire:model="privacy.email_notifications">
                    Email notifications
                </flux:switch>
            </div>
        </flux:accordion.content>
    </flux:accordion.item>
</flux:accordion>
```

#### Tabs Interface
```blade
<flux:tabs default-value="overview">
    <flux:tabs.list>
        <flux:tabs.trigger value="overview">Overview</flux:tabs.trigger>
        <flux:tabs.trigger value="analytics">Analytics</flux:tabs.trigger>
        <flux:tabs.trigger value="settings">Settings</flux:tabs.trigger>
    </flux:tabs.list>

    <flux:tabs.content value="overview">
        <flux:card>
            <flux:heading>Project Overview</flux:heading>
            <flux:text>Dashboard overview content here...</flux:text>
        </flux:card>
    </flux:tabs.content>

    <flux:tabs.content value="analytics">
        <flux:card>
            <flux:heading>Analytics Data</flux:heading>
            <flux:chart
                type="line"
                :data="$analyticsData"
                height="300"
            />
        </flux:card>
    </flux:tabs.content>

    <flux:tabs.content value="settings">
        <flux:card>
            <flux:heading>Project Settings</flux:heading>
            <form wire:submit="saveSettings">
                <flux:field>
                    <flux:label>Project Name</flux:label>
                    <flux:input wire:model="settings.name" />
                </flux:field>
            </form>
        </flux:card>
    </flux:tabs.content>
</flux:tabs>
```

### Advanced Input Components

#### Date Picker
```blade
<flux:field>
    <flux:label>Project Deadline</flux:label>
    <flux:date-picker
        wire:model="project.deadline"
        :min-date="today()"
        :max-date="today()->addYears(2)"
        format="Y-m-d"
    />
</flux:field>

{{-- Range date picker --}}
<flux:field>
    <flux:label>Event Date Range</flux:label>
    <flux:date-picker
        wire:model="event.date_range"
        mode="range"
        placeholder="Select start and end dates"
    />
</flux:field>
```

#### Calendar Component
```blade
<flux:calendar
    wire:model="selectedDate"
    :events="$events"
    :available-dates="$availableDates"
    @date-selected="handleDateSelection"
>
    <flux:calendar.event
        v-for="event in events"
        :key="event.id"
        :date="event.date"
        :title="event.title"
        :color="event.color"
    />
</flux:calendar>
```

#### Autocomplete Search
```blade
<flux:field>
    <flux:label>Search Users</flux:label>
    <flux:autocomplete
        wire:model="selectedUser"
        :options="$userOptions"
        option-label="name"
        option-value="id"
        placeholder="Type to search users..."
        :loading="$searchLoading"
    >
        <template #option="{ option }">
            <div class="flex items-center gap-3">
                <flux:avatar :src="option.avatar" size="sm" />
                <div>
                    <div class="font-medium">{{ option.name }}</div>
                    <div class="text-sm text-gray-600">{{ option.email }}</div>
                </div>
            </div>
        </template>
    </flux:autocomplete>
</flux:field>
```

#### Rich Text Editor
```blade
<flux:field>
    <flux:label>Post Content</flux:label>
    <flux:editor
        wire:model="post.content"
        :toolbar="['bold', 'italic', 'underline', 'link', 'image', 'list']"
        placeholder="Write your post content..."
        height="300"
    />
</flux:field>

{{-- Advanced editor with file upload --}}
<flux:editor
    wire:model="article.body"
    :toolbar="['format', 'bold', 'italic', 'link', 'image', 'table', 'code']"
    :image-upload-url="route('images.upload')"
    :file-upload-enabled="true"
    class="min-h-96"
/>
```

### Layout and Display Components

#### Enhanced Cards
```blade
<flux:card>
    <flux:card.header>
        <flux:heading size="lg">Project Statistics</flux:heading>
        <flux:button variant="ghost" size="sm">
            <flux:icon name="more-vertical" />
        </flux:button>
    </flux:card.header>

    <flux:card.body>
        <div class="grid grid-cols-3 gap-4">
            <div class="text-center">
                <flux:text size="2xl" weight="bold">156</flux:text>
                <flux:text variant="muted">Total Tasks</flux:text>
            </div>
            <div class="text-center">
                <flux:text size="2xl" weight="bold">89%</flux:text>
                <flux:text variant="muted">Completion</flux:text>
            </div>
            <div class="text-center">
                <flux:text size="2xl" weight="bold">23</flux:text>
                <flux:text variant="muted">Team Members</flux:text>
            </div>
        </div>
    </flux:card.body>

    <flux:card.footer>
        <flux:button variant="primary" size="sm">View Details</flux:button>
    </flux:card.footer>
</flux:card>
```

#### Data Visualization
```blade
<flux:card>
    <flux:card.header>
        <flux:heading>Revenue Overview</flux:heading>
    </flux:card.header>

    <flux:card.body>
        <flux:chart
            type="bar"
            :data="$revenueData"
            :options="{
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Monthly Revenue'
                    }
                }
            }"
            height="400"
        />
    </flux:card.body>
</flux:card>

{{-- Line chart with real-time updates --}}
<flux:chart
    type="line"
    :data="$liveMetrics"
    :options="$chartOptions"
    wire:poll.5s="updateMetrics"
    height="250"
/>
```

### Interactive Feedback Components

#### Toast Notifications
```blade
{{-- Trigger toasts from Livewire --}}
<flux:button wire:click="saveChanges">
    Save Changes
</flux:button>

{{-- In your Livewire component --}}
@script
<script>
// Listen for toast events
Livewire.on('toast', (data) => {
    window.FluxUI.toast({
        title: data.title,
        description: data.message,
        variant: data.type,
        duration: 5000
    });
});
</script>
@endscript

{{-- Manual toast trigger --}}
<flux:button @click="$flux.toast({ title: 'Success!', description: 'Operation completed successfully', variant: 'success' })">
    Show Toast
</flux:button>
```

#### Advanced Popovers
```blade
<flux:popover>
    <flux:button slot="trigger">
        User Actions
    </flux:button>

    <flux:popover.content>
        <div class="p-4 space-y-2">
            <flux:heading size="sm">Quick Actions</flux:heading>
            <flux:separator />

            <flux:button variant="ghost" size="sm" wire:click="editUser">
                <flux:icon name="edit" />
                Edit Profile
            </flux:button>

            <flux:button variant="ghost" size="sm" wire:click="viewActivity">
                <flux:icon name="activity" />
                View Activity
            </flux:button>

            <flux:separator />

            <flux:button variant="ghost" size="sm" class="text-red-600">
                <flux:icon name="trash" />
                Delete User
            </flux:button>
        </div>
    </flux:popover.content>
</flux:popover>
```

#### Command Palette
```blade
<flux:command wire:model="commandOpen">
    <flux:command.input placeholder="Type a command or search..." />

    <flux:command.list>
        <flux:command.empty>No results found.</flux:command.empty>

        <flux:command.group heading="Suggestions">
            <flux:command.item wire:click="createProject">
                <flux:icon name="plus" />
                Create new project
            </flux:command.item>

            <flux:command.item wire:click="openSettings">
                <flux:icon name="settings" />
                Open settings
            </flux:command.item>
        </flux:command.group>

        <flux:command.separator />

        <flux:command.group heading="Recent Projects">
            @foreach($recentProjects as $project)
                <flux:command.item wire:click="openProject({{ $project->id }})">
                    <flux:icon name="folder" />
                    {{ $project->name }}
                </flux:command.item>
            @endforeach
        </flux:command.group>
    </flux:command.list>
</flux:command>
```

### Advanced Pagination
```blade
<flux:pagination
    :current-page="$currentPage"
    :total-pages="$totalPages"
    :per-page="$perPage"
    :total-items="$totalItems"
    wire:model="currentPage"
    show-per-page-selector
    :per-page-options="[10, 25, 50, 100]"
    show-jump-to-page
/>

{{-- Simplified pagination --}}
<flux:pagination
    :current-page="$users->currentPage()"
    :last-page="$users->lastPage()"
    :path="$users->url(1)"
    class="mt-6"
/>
```

## Advanced Integration Patterns

### Real-time Components with Broadcasting
```blade
<flux:card wire:poll.5s="refreshData">
    <flux:card.header>
        <flux:heading>Live Dashboard</flux:heading>
        <flux:badge variant="success">
            <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></div>
            Live
        </flux:badge>
    </flux:card.header>

    <flux:card.body>
        <flux:chart
            type="line"
            :data="$liveData"
            :options="$chartOptions"
        />
    </flux:card.body>
</flux:card>
```

### Complex Forms with Validation
```blade
<form wire:submit="saveProduct">
    <flux:tabs default-value="basic">
        <flux:tabs.list>
            <flux:tabs.trigger value="basic">Basic Info</flux:tabs.trigger>
            <flux:tabs.trigger value="pricing">Pricing</flux:tabs.trigger>
            <flux:tabs.trigger value="media">Media</flux:tabs.trigger>
        </flux:tabs.list>

        <flux:tabs.content value="basic">
            <div class="space-y-4">
                <flux:field>
                    <flux:label>Product Name</flux:label>
                    <flux:input wire:model="product.name" />
                    @error('product.name') <flux:text variant="error">{{ $message }}</flux:text> @enderror
                </flux:field>

                <flux:field>
                    <flux:label>Description</flux:label>
                    <flux:editor wire:model="product.description" />
                    @error('product.description') <flux:text variant="error">{{ $message }}</flux:text> @enderror
                </flux:field>
            </div>
        </flux:tabs.content>

        <flux:tabs.content value="pricing">
            <div class="space-y-4">
                <flux:field>
                    <flux:label>Price</flux:label>
                    <flux:input wire:model="product.price" type="number" step="0.01" />
                    @error('product.price') <flux:text variant="error">{{ $message }}</flux:text> @enderror
                </flux:field>

                <flux:field>
                    <flux:label>Sale Date Range</flux:label>
                    <flux:date-picker wire:model="product.sale_period" mode="range" />
                </flux:field>
            </div>
        </flux:tabs.content>

        <flux:tabs.content value="media">
            <flux:field>
                <flux:label>Product Images</flux:label>
                <div wire:drop="handleFileDrop" class="border-2 border-dashed p-8 text-center">
                    Drop files here or click to upload
                </div>
            </flux:field>
        </flux:tabs.content>
    </flux:tabs>

    <div class="flex gap-2 mt-6">
        <flux:button type="submit">Save Product</flux:button>
        <flux:button variant="secondary" type="button">Cancel</flux:button>
    </div>
</form>
```

## Pro-Specific Best Practices

### Performance Optimization
- **Lazy load charts** - Load chart data only when tabs become visible
- **Debounce autocomplete** - Use appropriate debouncing for search inputs
- **Paginate large datasets** - Use server-side pagination for tables
- **Optimize editors** - Initialize rich text editors only when needed

### Accessibility Enhancements
- **Keyboard navigation** - Ensure all interactive components support keyboard navigation
- **Screen reader support** - Proper ARIA labels and descriptions
- **Color contrast** - Ensure sufficient contrast in charts and data visualizations
- **Focus management** - Proper focus handling in modals and popovers

### Professional UI Patterns
- **Consistent spacing** - Use systematic spacing in complex layouts
- **Progressive disclosure** - Use accordions and tabs to manage information density
- **Contextual actions** - Use popovers and context menus for space-efficient interfaces
- **Status communication** - Use toasts and badges for real-time status updates