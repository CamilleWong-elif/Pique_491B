import svgPaths from "./svg-651fz6ztng";

function BackButton() {
  return (
    <div className="absolute left-[44px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] size-[40px] top-[42px]" data-name="Back Button">
      <button className="absolute block cursor-pointer left-0 size-[40px] top-0">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
          <circle cx="20" cy="20" fill="var(--fill-0, #D9D9D9)" id="Ellipse 9" r="20" />
        </svg>
      </button>
      <div className="absolute flex h-0 items-center justify-center left-[12px] top-[20px] w-[18.5px]">
        <div className="flex-none rotate-[180deg]">
          <div className="h-0 relative w-[18.5px]">
            <div className="absolute inset-[-7.36px_-5.41%]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.5 14.7279">
                <path d={svgPaths.p1642900} fill="var(--stroke-0, black)" id="Arrow 1" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateButton() {
  return (
    <div className="absolute h-[55px] left-[34px] top-[759px] w-[325px]" data-name="Create Button">
      <div className="absolute bg-[#5d5d5d] h-[55px] left-0 rounded-[3px] top-0 w-[325px]" />
      <div className="absolute flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[42px] justify-center leading-[0] left-[163.5px] not-italic text-[24px] text-center text-white top-[29px] tracking-[-0.48px] translate-x-[-50%] translate-y-[-50%] w-[155px]">
        <p className="css-4hzbpn leading-[1.2]">Create</p>
      </div>
    </div>
  );
}

function EventDescriptor() {
  return (
    <div className="absolute h-[887px] left-[24px] top-[24px] w-[345px]" data-name="Event Descriptor">
      <div className="absolute inset-[0_0_-29.11%_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 345 1145.25">
          <g id="Event Descriptor">
            <rect fill="var(--fill-0, #D9D9D9)" height="203" id="Rectangle 16" width="345" />
            <rect fill="var(--fill-0, #D9D9D9)" height="126" id="Rectangle 18" width="213" x="66" y="940" />
            <path d="M66 1102H273" id="Vector 18" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeOpacity="0.85" strokeWidth="0.5" />
            <path d="M66 1122H273" id="Vector 19" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeOpacity="0.85" strokeWidth="0.5" />
            <path d="M66 1145H273" id="Vector 20" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeOpacity="0.85" strokeWidth="0.5" />
            <path d="M17 345H322" id="Vector 10" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeOpacity="0.85" strokeWidth="0.5" />
            <path d="M24 309L106 309" id="Vector 11" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeOpacity="0.85" strokeWidth="0.5" />
            <path d="M247 309L329 309" id="Vector 12" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeOpacity="0.85" strokeWidth="0.5" />
            <path d="M17 365H322" id="Vector 13" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeOpacity="0.85" strokeWidth="0.5" />
            <path d="M17 388H322" id="Vector 14" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeOpacity="0.85" strokeWidth="0.5" />
            <rect fill="var(--fill-0, #D9D9D9)" height="126" id="Rectangle 17" width="213" x="66" y="437" />
            <rect fill="var(--fill-0, #D9D9D9)" height="126" id="Rectangle 18_2" width="213" x="66" y="682" />
            <path d="M66 599H273" id="Vector 15" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeOpacity="0.85" strokeWidth="0.5" />
            <path d="M66 844H273" id="Vector 18_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeOpacity="0.85" strokeWidth="0.5" />
            <path d="M66 619H273" id="Vector 16" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeOpacity="0.85" strokeWidth="0.5" />
            <path d="M66 864H273" id="Vector 19_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeOpacity="0.85" strokeWidth="0.5" />
            <path d="M66 642H273" id="Vector 17" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeOpacity="0.85" strokeWidth="0.5" />
            <path d="M66 887H273" id="Vector 20_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeOpacity="0.85" strokeWidth="0.5" />
            <path d={svgPaths.pec9b200} fill="var(--fill-0, #D9D9D9)" id="Star 11" />
            <path d={svgPaths.p6dcd80} fill="var(--fill-0, #D9D9D9)" id="Star 12" />
            <path d={svgPaths.p20001780} fill="var(--fill-0, #D9D9D9)" id="Star 13" />
            <path d={svgPaths.p3ea2e000} fill="var(--fill-0, #D9D9D9)" id="Star 14" />
          </g>
        </svg>
      </div>
    </div>
  );
}

export default function IPhone16CreateEvent() {
  return (
    <div className="bg-white relative size-full" data-name="iPhone 16 - Create Event">
      <BackButton />
      <CreateButton />
      <EventDescriptor />
    </div>
  );
}