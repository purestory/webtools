import { useState, useContext } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Search, User, MapPin, Globe, Copy, ExternalLink, AlertCircle, Wifi } from 'lucide-react';
import { LanguageContext } from '../contexts/LanguageContext';
import { t } from '../locales/translations';

const IPInfo = () => {
  const { language } = useContext(LanguageContext);
  const [ipAddress, setIpAddress] = useState('');
  const [ipInfo, setIpInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateIP = (ip) => {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  };

  const getMyIP = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      setIpAddress(data.ip);
      await getIPInfo(data.ip);
    } catch (err) {
      setError(t(language, 'ipInfo.errorMyIp'));
    } finally {
      setLoading(false);
    }
  };

  const getIPInfo = async (targetIP = ipAddress) => {
    if (!targetIP.trim()) {
      setError(t(language, 'ipInfo.errorEmpty'));
      return;
    }

    if (!validateIP(targetIP.trim())) {
      setError(t(language, 'ipInfo.errorInvalid'));
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // 무료 IP 정보 API 사용 (ipapi.co - HTTPS 지원)
      const response = await fetch(`https://ipapi.co/${targetIP.trim()}/json/`);
      const data = await response.json();
      
      if (data.error) {
        setError(data.reason || t(language, 'ipInfo.errorReason'));
        return;
      }

      // ipapi.co 응답을 기존 구조에 맞게 변환
      const transformedData = {
        query: data.ip,
        country: data.country_name,
        countryCode: data.country_code,
        region: data.region_code,
        regionName: data.region,
        city: data.city,
        zip: data.postal,
        lat: data.latitude,
        lon: data.longitude,
        timezone: data.timezone,
        isp: data.org,
        org: data.org,
        as: data.asn
      };

      setIpInfo(transformedData);
    } catch (err) {
      setError(t(language, 'ipInfo.errorFetch'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    getIPInfo();
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  const formatCoordinates = (lat, lon) => {
    return `${lat}, ${lon}`;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Page Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold tracking-tight">{t(language, 'ipInfo.title')}</h1>
        </div>

        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t(language, 'ipInfo.inputTitle')}</CardTitle>
            <CardDescription>
              {t(language, 'ipInfo.inputDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ip-address">{t(language, 'ipInfo.ipLabel')}</Label>
                <Input
                  id="ip-address"
                  type="text"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  placeholder={t(language, 'ipInfo.ipPlaceholder')}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  {loading ? t(language, 'ipInfo.lookupInProgress') : t(language, 'ipInfo.lookup')}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={getMyIP}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  {t(language, 'ipInfo.myIp')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* IP Info Results */}
        {ipInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t(language, 'ipInfo.resultTitle').replace('{ip}', ipInfo.query)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Location Info */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {t(language, 'ipInfo.locationInfo')}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                      <span className="text-sm font-medium">{t(language, 'ipInfo.country')}:</span>
                      <div className="flex items-center gap-2">
                        <span>{ipInfo.country} ({ipInfo.countryCode})</span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => copyToClipboard(ipInfo.country)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                      <span className="text-sm font-medium">{t(language, 'ipInfo.region')}:</span>
                      <div className="flex items-center gap-2">
                        <span>{ipInfo.regionName}</span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => copyToClipboard(ipInfo.regionName)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                      <span className="text-sm font-medium">{t(language, 'ipInfo.city')}:</span>
                      <div className="flex items-center gap-2">
                        <span>{ipInfo.city}</span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => copyToClipboard(ipInfo.city)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {ipInfo.zip && (
                      <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                        <span className="text-sm font-medium">{t(language, 'ipInfo.zipCode')}:</span>
                        <div className="flex items-center gap-2">
                          <span>{ipInfo.zip}</span>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => copyToClipboard(ipInfo.zip)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                      <span className="text-sm font-medium">{t(language, 'ipInfo.coordinates')}:</span>
                      <div className="flex items-center gap-2">
                        <span>{formatCoordinates(ipInfo.lat, ipInfo.lon)}</span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => copyToClipboard(formatCoordinates(ipInfo.lat, ipInfo.lon))}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => window.open(`https://www.google.com/maps?q=${ipInfo.lat},${ipInfo.lon}`, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                      <span className="text-sm font-medium">{t(language, 'ipInfo.timezone')}:</span>
                      <div className="flex items-center gap-2">
                        <span>{ipInfo.timezone}</span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => copyToClipboard(ipInfo.timezone)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Network Info */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold flex items-center gap-2">
                    <Wifi className="h-5 w-5" />
                    {t(language, 'ipInfo.networkInfo')}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                      <span className="text-sm font-medium">{t(language, 'ipInfo.isp')}:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-right">{ipInfo.isp}</span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => copyToClipboard(ipInfo.isp)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                      <span className="text-sm font-medium">{t(language, 'ipInfo.organization')}:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-right">{ipInfo.org}</span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => copyToClipboard(ipInfo.org)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {ipInfo.as && (
                      <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                        <span className="text-sm font-medium">{t(language, 'ipInfo.asNumber')}:</span>
                        <div className="flex items-center gap-2">
                          <span>{ipInfo.as}</span>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => copyToClipboard(ipInfo.as)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        <Card>
          <CardHeader>
            <CardTitle>IP 정보 조회란?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              IP 주소를 통해 해당 IP의 지리적 위치, 인터넷 서비스 제공업체(ISP), 네트워크 정보 등을 확인할 수 있습니다.
            </p>
            
            <div className="bg-muted/10 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">주요 활용 사례</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>웹사이트 방문자 분석</li>
                <li>보안 위협 분석</li>
                <li>지역별 콘텐츠 제공</li>
                <li>네트워크 문제 해결</li>
              </ul>
            </div>

            <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-700">
                <strong>주의:</strong> IP 위치 정보는 근사치이며, 실제 물리적 위치와 다를 수 있습니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IPInfo; 