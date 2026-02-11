
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { type CardData, initialCardData, type SocialLink } from '../types';
import { PhonePreview } from '../components/card/PhonePreview';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Icon } from '../components/ui/Icon';
import { ShareModal } from '../components/card/ShareModal';
import { resizeImage } from '../utils/image';
import {
    User,
    Link as LinkIcon,
    Palette,
    Save,
    ArrowLeft,
    Plus,
    Trash2,
    Image as ImageIcon,
    Share2
} from 'lucide-react';

export function CardEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'details' | 'links' | 'design'>('details');
    // Deep copy initial state to avoid reference issues
    const [data, setData] = useState<CardData>(() => JSON.parse(JSON.stringify(initialCardData)));
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load data on mount if ID exists
    useEffect(() => {
        if (id) {
            const saved = localStorage.getItem(`card-${id}`);
            if (saved) {
                setData(JSON.parse(saved));
            }
        }
    }, [id]);

    const handleSave = () => {
        const cardId = id || crypto.randomUUID();
        const newData = { ...data, id: cardId };

        try {
            localStorage.setItem(`card-${cardId}`, JSON.stringify(newData));

            if (!id) {
                navigate(`/editor/${cardId}`, { replace: true });
            } else {
                alert('Card saved successfully!');
            }
        } catch (e) {
            console.error('Save failed:', e);
            if (e instanceof DOMException && e.name === 'QuotaExceededError') {
                alert('Storage full! Please delete some old cards or use a smaller image.');
            } else {
                alert('Failed to save card. Please try again.');
            }
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const base64 = await resizeImage(file, 300, 300);
            setData(prev => ({ ...prev, avatarUrl: base64 }));
        } catch (error) {
            console.error('Failed to process image:', error);
            alert('Failed to upload image. Please try another file.');
        } finally {
            // Reset input so same file can be selected again
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    const addLink = () => {
        const newLink: SocialLink = {
            id: crypto.randomUUID(),
            title: 'New Link',
            url: 'https://',
            icon: 'Link',
            active: true,
        };
        setData({ ...data, links: [...data.links, newLink] });
    };


    const updateLink = (id: string, field: keyof SocialLink, value: any) => {
        setData({
            ...data,
            links: data.links.map(l => l.id === id ? { ...l, [field]: value } : l),
        });
    };

    const removeLink = (id: string) => {
        setData({
            ...data,
            links: data.links.filter(l => l.id !== id),
        });
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl h-[calc(100vh-80px)]">

            {/* Header */}
            <header className="flex items-center justify-between mb-8">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Dashboard
                </button>
                <div className="flex gap-4">
                    {id && (
                        <Button
                            variant="secondary"
                            onClick={() => setShareModalOpen(true)}
                            className="flex items-center gap-2"
                        >
                            <Share2 size={18} />
                            Share
                        </Button>
                    )}
                    <Button onClick={handleSave} className="flex items-center gap-2">
                        <Save size={18} />
                        Save Card
                    </Button>
                </div>
            </header>

            <div className="grid lg:grid-cols-2 gap-12 h-full">

                {/* Editor Panel */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 h-full flex flex-col overflow-hidden">

                    {/* Tabs */}
                    <div className="flex gap-2 p-1 bg-slate-950/50 rounded-lg mb-6 shrink-0">
                        {[
                            { id: 'details', label: 'Details', icon: User },
                            { id: 'links', label: 'Links', icon: LinkIcon },
                            { id: 'design', label: 'Design', icon: Palette },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-slate-800 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">

                        {activeTab === 'details' && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="flex justify-center mb-6">
                                    <div
                                        className="relative group cursor-pointer w-32 h-32 rounded-full overflow-hidden border-4 border-slate-700 hover:border-sky-500 transition-colors shadow-xl"
                                        onClick={triggerFileUpload}
                                    >
                                        <img src={data.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                            <ImageIcon className="text-white mb-1" size={24} />
                                            <span className="text-white text-xs font-medium">Change Photo</span>
                                        </div>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleAvatarUpload}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>

                                <div className="text-center mb-4">
                                    <button
                                        onClick={triggerFileUpload}
                                        className="text-sm text-sky-400 hover:text-sky-300 font-medium"
                                    >
                                        Upload New Image
                                    </button>
                                </div>

                                <Input
                                    label="Full Name"
                                    value={data.fullName}
                                    onChange={(e) => setData({ ...data, fullName: e.target.value })}
                                    placeholder="e.g. Alex Doe"
                                />
                                <Input
                                    label="Job Title"
                                    value={data.jobTitle}
                                    onChange={(e) => setData({ ...data, jobTitle: e.target.value })}
                                    placeholder="e.g. Product Designer"
                                />
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Bio</label>
                                    <textarea
                                        value={data.bio}
                                        onChange={(e) => setData({ ...data, bio: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 min-h-[100px] resize-none"
                                        placeholder="Tell your story..."
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'links' && (
                            <div className="space-y-4 animate-fade-in">
                                {data.links.map((link) => (
                                    <div key={link.id} className="bg-slate-950/30 p-4 rounded-xl border border-slate-800/50 group">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-slate-800 rounded-lg">
                                                <Icon name={link.icon} size={16} className="text-slate-400" />
                                            </div>
                                            <div className="flex-1 font-medium text-slate-200">
                                                {link.title}
                                            </div>
                                            <button
                                                onClick={() => removeLink(link.id)}
                                                className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className="grid gap-3">
                                            <div className="flex gap-3">
                                                <div className="w-1/3">
                                                    <select
                                                        value={link.icon}
                                                        onChange={(e) => updateLink(link.id, 'icon', e.target.value)}
                                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                                    >
                                                        <option value="Link">Link</option>
                                                        <option value="Globe">Website</option>
                                                        <option value="Github">Github</option>
                                                        <option value="Linkedin">LinkedIn</option>
                                                        <option value="Twitter">Twitter</option>
                                                        <option value="Instagram">Instagram</option>
                                                        <option value="Facebook">Facebook</option>
                                                        <option value="Youtube">YouTube</option>
                                                        <option value="Twitch">Twitch</option>
                                                        <option value="Mail">Email</option>
                                                        <option value="Phone">Phone</option>
                                                        <option value="MapPin">Location</option>
                                                        <option value="Music">Music</option>
                                                        <option value="Video">Video</option>
                                                        <option value="FileText">Document</option>
                                                        <option value="LeetCode">LeetCode</option>
                                                        <option value="Code">Code</option>
                                                    </select>
                                                </div>
                                                <Input
                                                    placeholder="Title (e.g. My Portfolio)"
                                                    value={link.title}
                                                    onChange={(e) => updateLink(link.id, 'title', e.target.value)}
                                                    className="bg-slate-900 border-slate-800 flex-1"
                                                />
                                            </div>
                                            <Input
                                                placeholder="URL (https://...)"
                                                value={link.url}
                                                onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                                                className="bg-slate-900 border-slate-800"
                                            />
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={addLink}
                                    className="w-full py-3 rounded-xl border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 hover:bg-slate-800/50 transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={18} />
                                    Add Link
                                </button>
                            </div>
                        )}

                        {activeTab === 'design' && (
                            <div className="space-y-8 animate-fade-in">
                                <div>
                                    <h3 className="text-sm font-medium text-slate-400 mb-4">Card Style</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['modern', 'glass', 'neon', 'classic'].map((style) => (
                                            <button
                                                key={style}
                                                onClick={() => setData({ ...data, theme: { ...data.theme, style: style as any } })}
                                                className={`p-4 rounded-xl border text-left transition-all ${data.theme.style === style
                                                    ? 'border-sky-500 bg-sky-500/10 text-white'
                                                    : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                                                    }`}
                                            >
                                                <div className="capitalize font-medium mb-1">{style}</div>
                                                <div className="text-xs opacity-60">
                                                    {style === 'glass' ? 'Blurred background' : style === 'neon' ? 'Glowing borders' : 'Clean layout'}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-slate-400 mb-4">Font Family</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {['Inter', 'Roboto', 'Playfair Display', 'Mono'].map((font) => (
                                            <button
                                                key={font}
                                                onClick={() => setData({ ...data, theme: { ...data.theme, fontFamily: font } })}
                                                className={`px-4 py-2 rounded-lg text-sm border transition-colors ${data.theme.fontFamily === font
                                                    ? 'border-sky-500 text-sky-400 bg-sky-950/30'
                                                    : 'border-slate-700 text-slate-400 hover:border-slate-500'
                                                    }`}
                                            >
                                                {font}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>


                </div>

                {/* Preview Panel */}
                <div className="hidden lg:flex items-center justify-center h-full relative">
                    <div className="sticky top-24">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-sky-500/20 to-purple-500/20 blur-3xl rounded-full opacity-50 pointer-events-none" />
                        <PhonePreview data={data} />
                    </div>
                </div>

            </div>

            <ShareModal
                card={data}
                isOpen={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
            />
        </div>
    );
}
