# MassDwell Finish Selection Portal

A professional customer-facing portal for selecting finishes and options for MassDwell ADU projects.

## Features

### Customer Portal
- **Unique link authentication** - No login required, secure token-based access
- **Visual finish selection** - Large product photos with clear descriptions
- **Mobile-first responsive design** - Works perfectly on all devices
- **Progress tracking** - Visual progress indicator showing completion
- **Category navigation** - Easy switching between finish categories
- **Price transparency** - Clear upgrade costs and standard options
- **Selection confirmation** - Review and lock in all selections

### Admin Dashboard
- **Project management** - Create and manage customer projects
- **Selection monitoring** - View all customer selections in real-time
- **PDF generation** - Generate professional selection summaries
- **Project status tracking** - Track completion and lock selections
- **Customer link generation** - Easy access link copying

### Finish Categories
- Flooring (LVP, tile, hardwood)
- Kitchen Cabinets (colors/styles)
- Countertops (quartz, laminate, granite)
- Bathroom Fixtures
- Paint Colors (interior walls, trim)
- Hardware (handles, knobs)
- Appliances (if applicable)

## Tech Stack

- **Frontend:** Next.js 14+ with React 19
- **Styling:** Tailwind CSS with custom MassDwell brand colors
- **Backend:** Supabase (PostgreSQL database)
- **Authentication:** Token-based for customers, password for admin
- **PDF Generation:** jsPDF for selection summaries
- **Deployment:** Vercel (ready to deploy)

## Quick Setup

### 1. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL in `database-setup.sql` in your Supabase SQL editor
3. This will create all tables and sample data

### 2. Environment Configuration

1. Copy `.env.local.example` to `.env.local`
2. Update with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password
   ```

### 3. Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:3000` for the customer portal and `http://localhost:3000/admin` for admin.

## Deployment to Vercel

### Automatic Deployment

1. Push this code to a GitHub repository
2. Connect the repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## Usage

### For Admins

1. Visit `/admin` and login with your admin password
2. Create new projects for customers
3. Copy the unique customer links
4. Send links to customers via email
5. Monitor selections in real-time
6. Generate PDF summaries when complete

### For Customers

1. Click the unique link received from MassDwell
2. View project details and ADU model
3. Browse each finish category
4. Select preferred options (can change until submission)
5. Review all selections
6. Submit to lock in choices

## Brand Colors

- **Deep Navy:** `#011832` - Primary brand color
- **Admiral Blue:** `#132C49` - Secondary brand color  
- **Soft Denim:** `#445970` - Accent color
- **White:** `#FFFFFF` - Background and text

## Database Schema

### Tables

- **projects** - Customer projects and access tokens
- **finish_categories** - Categories of finishes (flooring, cabinets, etc.)
- **finish_options** - Individual options within each category
- **project_selections** - Customer selections linking projects to options

### Key Features

- UUID primary keys for security
- Row Level Security (RLS) enabled
- Automatic timestamps with triggers
- Foreign key relationships with cascading deletes
- Sample data included for immediate testing

## Customization

### Adding New Finish Categories

1. Add to `finish_categories` table in Supabase
2. Add options to `finish_options` table
3. Categories will automatically appear in the portal

### Updating Finish Options

1. Edit directly in Supabase database
2. Add `image_url` for product photos
3. Set `price_upgrade` for additional costs
4. Use `display_order` to control sorting

### Styling Changes

- Edit `src/app/globals.css` for global styles
- Update CSS custom properties for brand colors
- Modify components for layout changes

## Production Considerations

### Security

- Admin password should be complex and rotated regularly
- Consider implementing proper authentication for admin area
- Review RLS policies for production use
- Use HTTPS in production (automatic with Vercel)

### Performance

- Add image optimization service for product photos
- Implement caching for frequently accessed data
- Monitor Supabase usage and upgrade plan as needed
- Use Vercel's analytics for performance monitoring

### Maintenance

- Regularly backup your Supabase database
- Monitor error logs in Vercel dashboard
- Keep dependencies updated
- Test on multiple devices and browsers

## Support

For technical support or feature requests, contact the MassDwell development team.

## License

Copyright 2026 MassDwell. All rights reserved.