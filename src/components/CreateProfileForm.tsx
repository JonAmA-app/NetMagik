import React, { useState, useEffect } from 'react';
import { IpType, IpConfig, Profile, Language } from '../types';
import { X, Save } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface CreateProfileFormProps {
  initialProfile?: Profile | null;
  onSave: (profile: Profile) => void;
  onCancel: () => void;
  language: Language;
}

export const CreateProfileForm: React.FC<CreateProfileFormProps> = ({ initialProfile, onSave, onCancel, language }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<IpType>(IpType.DHCP);
  const [config, setConfig] = useState<IpConfig>({
    ipAddress: '',
    subnetMask: '255.255.255.0',
    gateway: '',
    dnsPrimary: '8.8.8.8',
    dnsSecondary: ''
  });

  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];

  useEffect(() => {
    if (initialProfile) {
      setName(initialProfile.name);
      setType(initialProfile.type);
      if (initialProfile.config) {
        setConfig(initialProfile.config);
      }
    } else {
      // Reset form for new profile
      setName('');
      setType(IpType.DHCP);
      setConfig({
        ipAddress: '',
        subnetMask: '255.255.255.0',
        gateway: '',
        dnsPrimary: '8.8.8.8',
        dnsSecondary: ''
      });
    }
  }, [initialProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Easter Egg: Home Sweet Home
    if ((name.toLowerCase() === 'oasis' || name.toLowerCase() === 'hogar' || name.toLowerCase() === 'home') && config.ipAddress === '127.0.0.1') {
      window.dispatchEvent(new CustomEvent('easter-egg', { detail: { id: 'egg6', name: 'Home Sweet Home (127.0.0.1)' } }));
    }

    const newProfile: Profile = {
      id: initialProfile ? initialProfile.id : Date.now().toString(),
      name,
      type,
      config: type === IpType.STATIC ? config : undefined
    };
    onSave(newProfile);
  };

  return (
    <div className="bg-theme-bg-secondary border border-theme-border-primary rounded-xl p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-theme-text-primary">
          {initialProfile ? t.editProfile : t.newProfile}
        </h3>
        <button onClick={onCancel} className="text-theme-text-muted hover:text-theme-text-primary">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Input */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-theme-text-muted uppercase tracking-wider">{t.profileName}</label>
          <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.exampleProfileName}
            className="w-full bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg px-3 py-2 text-sm text-theme-text-primary focus:outline-none focus:border-theme-brand-primary"
          />
        </div>

        {/* Type Selection */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-theme-text-muted uppercase tracking-wider">{t.configType}</label>
          <div className="flex p-1 bg-theme-bg-tertiary rounded-lg border border-theme-border-secondary">
            <button
              type="button"
              onClick={() => setType(IpType.DHCP)}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${type === IpType.DHCP
                ? 'bg-theme-bg-primary text-theme-text-primary shadow shadow-theme-border-primary'
                : 'text-theme-text-muted hover:text-theme-text-primary'
                }`}
            >
              DHCP
            </button>
            <button
              type="button"
              onClick={() => setType(IpType.STATIC)}
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${type === IpType.STATIC
                ? 'bg-theme-bg-primary text-theme-text-primary shadow shadow-theme-border-primary'
                : 'text-theme-text-muted hover:text-theme-text-primary'
                }`}
            >
              Static IP
            </button>
          </div>
        </div>

        {/* Static Fields */}
        {type === IpType.STATIC && (
          <div className="grid grid-cols-2 gap-4 pt-2 animate-in zoom-in-95 duration-200">
            <div className="space-y-1">
              <label className="text-xs text-theme-text-muted">{t.ipAddress}</label>
              <input
                required
                type="text"
                value={config.ipAddress}
                onChange={(e) => setConfig({ ...config, ipAddress: e.target.value })}
                className="w-full bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg px-3 py-2 text-sm text-theme-text-primary font-mono focus:border-theme-brand-primary focus:outline-none"
                placeholder={t.exampleIp}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-theme-text-muted">{t.subnetMask}</label>
              <input
                required
                type="text"
                value={config.subnetMask}
                onChange={(e) => setConfig({ ...config, subnetMask: e.target.value })}
                className="w-full bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg px-3 py-2 text-sm text-theme-text-primary font-mono focus:border-theme-brand-primary focus:outline-none"
                placeholder={t.exampleMask}
              />
            </div>
            <div className="space-y-1 col-span-2">
              <label className="text-xs text-theme-text-muted">{t.gateway}</label>
              <input
                type="text"
                value={config.gateway}
                onChange={(e) => setConfig({ ...config, gateway: e.target.value })}
                className="w-full bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg px-3 py-2 text-sm text-theme-text-primary font-mono focus:border-theme-brand-primary focus:outline-none"
                placeholder={t.exampleGateway}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-theme-text-muted">{t.primaryDns}</label>
              <input
                type="text"
                value={config.dnsPrimary}
                onChange={(e) => setConfig({ ...config, dnsPrimary: e.target.value })}
                className="w-full bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg px-3 py-2 text-sm text-theme-text-primary font-mono focus:border-theme-brand-primary focus:outline-none"
                placeholder={t.exampleDnsPrimary}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-theme-text-muted">{t.secondaryDns}</label>
              <input
                type="text"
                value={config.dnsSecondary}
                onChange={(e) => setConfig({ ...config, dnsSecondary: e.target.value })}
                className="w-full bg-theme-bg-tertiary border border-theme-border-secondary rounded-lg px-3 py-2 text-sm text-theme-text-primary font-mono focus:border-theme-brand-primary focus:outline-none"
                placeholder={t.exampleDnsSecondary}
              />
            </div>
          </div>
        )}

        <div className="pt-4 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 px-4 bg-theme-bg-tertiary border border-theme-border-primary rounded-lg text-theme-text-muted hover:bg-theme-bg-hover transition-colors"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            className="flex-1 py-2 px-4 bg-theme-brand-primary rounded-lg text-white font-medium hover:bg-theme-brand-hover transition-colors flex items-center justify-center gap-2"
          >
            <Save size={16} />
            {initialProfile ? t.updateProfile : t.saveProfile}
          </button>
        </div>
      </form>
    </div>
  );
};
