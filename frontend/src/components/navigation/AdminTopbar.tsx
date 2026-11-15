import React from 'react';
import { getAccount } from '../../lib/account';
import { navigate } from '../../lib/auth';
import NotificationBadge from '../notifications/NotificationBadge';
import AccountDropdown from '../account/AccountDropdown';
import { styleOf, cssText } from '../../lib/styles';
import { Crumb, parseCrumbString } from '../../lib/breadcrumbs';

export type { Crumb };

export type AdminTopbarProps = {
  crumbs?: Crumb[];
  crumb?: string;
  role?: string;
  menuOpen?: boolean;
  onNavigate?: (go: () => void) => void;
  onToggleSidebar?: () => void;
};

type State = {
  open: boolean;
  theme?: string;
};

class AdminTopbar extends React.Component<AdminTopbarProps, State> {
  static defaultProps = { crumb: 'Quản lý / Tổng quan', menuOpen: false };
  _esc?: (e: KeyboardEvent) => void;

  state: State = {
    open: !!this.props.menuOpen,
  };

  componentDidMount() {
    const self = this;
    this._esc = function (e: KeyboardEvent) {
      if (e.key === 'Escape' && self.state && self.state.open) {
        self.setState({ open: false });
      }
    };
    document.addEventListener('keydown', this._esc);
  }

  componentWillUnmount() {
    if (this._esc) {
      document.removeEventListener('keydown', this._esc);
    }
  }

  buildHref(c: Crumb): string {
    if (!c.page) return '#';
    const q = c.params ? '?' + new URLSearchParams(c.params).toString() : '';
    return '#' + c.page + q;
  }

  handleCrumbClick(e: React.MouseEvent, c: Crumb) {
    e.preventDefault();
    if (!c.page) return;
    const q = c.params ? '?' + new URLSearchParams(c.params).toString() : '';
    const target = c.page + q;
    const go = () => navigate(target);
    if (this.props.onNavigate) {
      this.props.onNavigate(go);
    } else {
      go();
    }
  }

  renderVals() {
    const s = this.state || {};
    const P = this.props;
    const self = this;
    const account = getAccount(P.role === 'Giáo viên' ? 'teacher' : 'admin');
    const open = s.open == null ? !!P.menuOpen : s.open;
    const theme = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light';

    function stop(e?: React.SyntheticEvent) {
      if (e) {
        e.preventDefault();
      }
    }

    const on =
      'display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 12px; border-radius: 8px; background: #FFFFFF; border: 1.5px solid #D6D4D0; font-size: 13px; font-weight: 600; color: #352637; text-decoration: none; cursor: pointer; white-space: nowrap; box-sizing: border-box';
    const off =
      'display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 12px; border-radius: 8px; border: 1.5px solid transparent; color: #706473; font-size: 13px; font-weight: 500; text-decoration: none; cursor: pointer; white-space: nowrap; box-sizing: border-box';

    const crumbsList: Crumb[] = P.crumbs && P.crumbs.length > 0
      ? P.crumbs
      : parseCrumbString(P.crumb || 'Quản lý / Tổng quan');

    return {
      crumbsList: crumbsList,
      name: account.name,
      initials: account.initials,
      email: account.email,
      role: P.role || 'Quản lý',
      open: open,
      isLight: theme === 'light',
      isDark: theme === 'dark',
      btnBg: open ? '#F3F0EA' : 'transparent',
      btnBorder: open ? '#D6D4D0' : 'transparent',
      lightStyle: theme === 'light' ? on : off,
      darkStyle: theme === 'dark' ? on : off,
      toggle: function (e?: React.SyntheticEvent) {
        stop(e);
        self.setState({ open: !open });
      },
      close: function () {
        self.setState({ open: false });
      },
      setLight: function (e?: React.SyntheticEvent) {
        stop(e);
        self.setState({ theme: 'light' });
      },
      setDark: function (e?: React.SyntheticEvent) {
        stop(e);
        self.setState({ theme: 'dark' });
      },
    };
  }

  render() {
    const v = this.renderVals();
    const crumbs = v.crumbsList;
    const parentCrumb = crumbs.length > 1 ? crumbs[crumbs.length - 2] : null;
    const currentCrumb = crumbs[crumbs.length - 1];

    return (
      <>
        <style>
          {cssText('\nbody{margin:0}\na{color:#2963CC}a:hover{color:#2257B8}\n\n')}
        </style>
        <div
          style={styleOf(
            "font-family: 'Inter', 'Be Vietnam Pro', 'Segoe UI', system-ui, sans-serif; color: #352637; font-size: 15px; line-height: 1.6"
          )}
        >
          <header
            style={styleOf(
              'position: relative; z-index: 30; height: 68px; box-sizing: border-box; border-bottom: 1.5px solid #D6D4D0; padding: 0 32px; display: flex; align-items: center; justify-content: space-between; gap: 16px; background: #FCFBF7'
            )}
          >
            <div className="flex items-center min-w-0 mr-4">
              {this.props.onToggleSidebar && (
                <button
                  type="button"
                  onClick={this.props.onToggleSidebar}
                  aria-label="Mở menu quản trị"
                  className="xl:hidden mr-3 p-1.5 rounded-lg text-[#352637] hover:bg-[#F3F0EA] transition-colors inline-flex items-center justify-center"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </svg>
                </button>
              )}

              {/* Breadcrumb đầy đủ cho màn hình máy tính bảng và máy tính (>= 768px) */}
              <nav aria-label="Đường dẫn" className="hidden md:flex items-center min-w-0 text-sm">
                <ol className="flex items-center flex-wrap gap-1 text-[#706473] list-none p-0 m-0">
                  {crumbs.map((c, index) => {
                    const isLast = index === crumbs.length - 1;
                    if (isLast) {
                      return (
                        <li key={index} className="flex items-center min-w-0" aria-current="page">
                          <span className="font-semibold text-[#352637] truncate">{c.label}</span>
                        </li>
                      );
                    }
                    return (
                      <li key={index} className="flex items-center whitespace-nowrap">
                        {c.page ? (
                          <a
                            href={this.buildHref(c)}
                            onClick={(e) => this.handleCrumbClick(e, c)}
                            className="text-[#706473] hover:text-[#2963CC] hover:underline focus-visible:underline focus-visible:outline-none transition-colors"
                          >
                            {c.label}
                          </a>
                        ) : (
                          <span className="text-[#706473]">{c.label}</span>
                        )}
                        <span aria-hidden="true" className="mx-2 text-[#9A8F9C] select-none">
                          /
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </nav>

              {/* Breadcrumb rút gọn cho màn hẹp (< 768px): ‹ {mục cha} / {mục cuối} */}
              <nav aria-label="Đường dẫn" className="md:hidden flex items-center min-w-0 text-sm">
                {parentCrumb ? (
                  <div className="flex items-center min-w-0">
                    {parentCrumb.page ? (
                      <a
                        href={this.buildHref(parentCrumb)}
                        onClick={(e) => this.handleCrumbClick(e, parentCrumb)}
                        className="text-[#706473] hover:text-[#2963CC] hover:underline truncate max-w-[120px] inline-flex items-center gap-1 font-medium"
                      >
                        <span aria-hidden="true">‹</span>
                        <span className="truncate">{parentCrumb.label}</span>
                      </a>
                    ) : (
                      <span className="text-[#706473] truncate max-w-[120px] inline-flex items-center gap-1 font-medium">
                        <span aria-hidden="true">‹</span>
                        <span className="truncate">{parentCrumb.label}</span>
                      </span>
                    )}
                    <span aria-hidden="true" className="mx-2 text-[#9A8F9C] select-none">
                      /
                    </span>
                    <span aria-current="page" className="font-semibold text-[#352637] truncate">
                      {currentCrumb ? currentCrumb.label : ''}
                    </span>
                  </div>
                ) : (
                  <span aria-current="page" className="font-semibold text-[#352637] truncate">
                    {currentCrumb ? currentCrumb.label : ''}
                  </span>
                )}
              </nav>
            </div>

            <div style={styleOf('display: flex; align-items: center; gap: 14px')}>
              <a
                href="#Notifications"
                onClick={(e) => {
                  e.preventDefault();
                  const go = () => navigate('Notifications');
                  if (this.props.onNavigate) {
                    this.props.onNavigate(go);
                  } else {
                    go();
                  }
                }}
                aria-label="Thông báo"
                style={styleOf(
                  'position: relative; width: 42px; height: 42px; box-sizing: border-box; border-radius: 50%; border: 1.5px solid #D6D4D0; display: flex; align-items: center; justify-content: center; color: #352637; text-decoration: none; background: #FFFFFF'
                )}
              >
                <svg
                  width={'19'}
                  height={'19'}
                  viewBox={'0 0 24 24'}
                  fill={'none'}
                  stroke={'currentColor'}
                  strokeWidth={'1.8'}
                  strokeLinecap={'round'}
                  strokeLinejoin={'round'}
                  aria-hidden={'true'}
                >
                  <path d={'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9'}></path>
                  <path d={'M10.3 21a1.94 1.94 0 0 0 3.4 0'}></path>
                </svg>
                <NotificationBadge
                  style={styleOf(
                    'position: absolute; top: -4px; right: -4px; min-width: 20px; height: 20px; padding: 0 5px; box-sizing: border-box; border-radius: 10px; background: #E5604A; color: #FFFFFF; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; border: 2px solid #FFFFFF'
                  )}
                />
              </a>
              <div style={styleOf('position: relative')}>
                <a
                  href={'#'}
                  onClick={v.toggle}
                  aria-haspopup={'menu'}
                  aria-expanded={v.open}
                  aria-label={'Mở menu tài khoản'}
                  style={styleOf(
                    'display: flex; align-items: center; gap: 10px; padding: 3px 10px 3px 3px; border-radius: 999px; border: 1.5px solid ' +
                      v.btnBorder +
                      '; background: ' +
                      v.btnBg +
                      '; color: #352637; text-decoration: none; cursor: pointer'
                  )}
                >
                  <span
                    style={styleOf(
                      'width: 36px; height: 36px; border-radius: 50%; border: 1.5px solid #D6D4D0; box-sizing: border-box; background: #C5CEF5; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; color: #352637'
                    )}
                  >
                    {v.initials}
                  </span>
                  <span
                    style={styleOf(
                      'font-size: 14px; font-weight: 600; white-space: nowrap'
                    )}
                  >
                    {v.name}
                  </span>
                  <span style={styleOf('display: flex; color: #706473')}>
                    <svg
                      width={'16'}
                      height={'16'}
                      viewBox={'0 0 24 24'}
                      fill={'none'}
                      stroke={'currentColor'}
                      strokeWidth={'2'}
                      strokeLinecap={'round'}
                      strokeLinejoin={'round'}
                      aria-hidden={'true'}
                    >
                      <path d={'M6 9l6 6 6-6'}></path>
                    </svg>
                  </span>
                </a>
                {v.open && <AccountDropdown v={v} />}
              </div>
            </div>
          </header>
        </div>
      </>
    );
  }
}

export default AdminTopbar;
