import svgPaths from "./svg-ej5232v3p3";
import imgShape from "figma:asset/11dbcb982f9ba115c7d5cc790cc48a457815fb67.png";
import imgShape1 from "figma:asset/cb1f88c3fe0319b995e5c66f91bc3a92d42d7b00.png";
import imgShape2 from "figma:asset/fca6c5639372eb9bb5f1763aeb5c7de699b6f721.png";
import imgMapMakerPosterPerfect from "figma:asset/5b3d2f5010a3063acd4446ece3b780cf3b99d50e.png";

function IcLoc() {
  return (
    <div className="absolute left-[calc(50%+12.5px)] size-[78px] top-[calc(50%+0.5px)] translate-x-[-50%] translate-y-[-50%]" data-name="ic_loc">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 78 78">
        <g id="ic_loc">
          <circle cx="39" cy="39" fill="var(--fill-0, #448AFF)" fillOpacity="0.3" id="oval" r="38.85" stroke="var(--stroke-0, #90B8F9)" strokeWidth="0.3" />
          <path d={svgPaths.p2eb82480} fill="var(--fill-0, #2F88FC)" id="oval_2" />
          <path clipRule="evenodd" d={svgPaths.p3e2e9800} fill="var(--fill-0, #FDFDFD)" fillRule="evenodd" id="oval (Stroke)" />
        </g>
      </svg>
    </div>
  );
}

function Avatar() {
  return (
    <div className="absolute left-[74px] overflow-clip rounded-[9999px] size-[40px] top-[13px]" data-name="Avatar">
      <div className="absolute left-1/2 size-[40px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="Shape">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgShape} />
      </div>
    </div>
  );
}

function Avatar1() {
  return (
    <div className="absolute left-[46px] overflow-clip rounded-[9999px] size-[40px] top-[222px]" data-name="Avatar">
      <div className="absolute left-1/2 size-[40px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="Shape">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgShape1} />
      </div>
    </div>
  );
}

function Avatar2() {
  return (
    <div className="absolute left-[294px] overflow-clip rounded-[9999px] size-[40px] top-[78px]" data-name="Avatar">
      <div className="absolute left-1/2 size-[40px] top-1/2 translate-x-[-50%] translate-y-[-50%]" data-name="Shape">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgShape2} />
      </div>
    </div>
  );
}

function InteractiveMap() {
  return (
    <div className="absolute left-[-25px] size-[443px] top-[174px]" data-name="Interactive Map">
      <div className="absolute left-0 size-[443px] top-0" data-name="🌎 Map Maker:  (Poster Perfect)">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgMapMakerPosterPerfect} />
      </div>
      <IcLoc />
      <Avatar />
      <Avatar1 />
      <Avatar2 />
    </div>
  );
}

function Block() {
  return (
    <div className="absolute bottom-[95px] h-[328px] left-0 right-0" data-name="block">
      <div className="absolute inset-[-4.57%_-3.82%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 423 358">
          <g id="block">
            <g filter="url(#filter0_d_1_391)" id="block_bg">
              <path clipRule="evenodd" d={svgPaths.p213cef00} fill="var(--fill-0, white)" fillRule="evenodd" />
            </g>
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="358" id="filter0_d_1_391" width="423" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset />
              <feGaussianBlur stdDeviation="7.5" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_391" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_1_391" mode="normal" result="shape" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Block1() {
  return (
    <div className="absolute contents left-[240px] top-[692px]" data-name="block">
      <div className="absolute bottom-[134.19px] h-[25.811px] left-[240px] right-[44px]" data-name="block_bg">
        <div className="absolute inset-[-58.12%_-13.76%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 139 55.8107">
            <g filter="url(#filter0_d_1_389)" id="block_bg">
              <path clipRule="evenodd" d={svgPaths.p1b7dda00} fill="var(--fill-0, black)" fillRule="evenodd" />
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="55.8107" id="filter0_d_1_389" width="139" x="0" y="0">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feOffset />
                <feGaussianBlur stdDeviation="7.5" />
                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
                <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_389" />
                <feBlend in="SourceGraphic" in2="effect1_dropShadow_1_389" mode="normal" result="shape" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
      <div className="absolute flex flex-col font-['Inter:Semi_Bold',sans-serif] font-semibold h-[21.031px] justify-center leading-[0] left-[295.1px] not-italic text-[16px] text-center text-white top-[705.38px] translate-x-[-50%] translate-y-[-50%] w-[103.011px]">
        <p className="css-4hzbpn leading-[1.4]">See details</p>
      </div>
    </div>
  );
}

function Component4353Reviews({ className }: { className?: string }) {
  return (
    <div className={className} data-name="4.3 (53 reviews)">
      <div className="absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal inset-0 justify-center leading-[0] not-italic text-[14px] text-[rgba(0,0,0,0.55)] text-center text-shadow-[0px_4px_4px_rgba(0,0,0,0.25)]">
        <p className="css-4hzbpn leading-[1.4]">4.3 (53 reviews)</p>
      </div>
    </div>
  );
}

function MapPin() {
  return (
    <div className="absolute h-[21px] left-[190px] top-[651px] w-[24px]" data-name="Map pin">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 21">
        <g clipPath="url(#clip0_1_386)" id="Map pin">
          <g id="Icon">
            <path d={svgPaths.p36bd7a80} stroke="var(--stroke-0, #757575)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
            <path d={svgPaths.p3f84c880} stroke="var(--stroke-0, #757575)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
          </g>
        </g>
        <defs>
          <clipPath id="clip0_1_386">
            <rect fill="white" height="21" width="24" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function DollarSign() {
  return (
    <div className="absolute left-[38px] size-[24px] top-[691px]" data-name="Dollar sign">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g clipPath="url(#clip0_1_396)" id="Dollar sign">
          <path d={svgPaths.p288ce020} id="Icon" stroke="var(--stroke-0, #1E1E1E)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
        </g>
        <defs>
          <clipPath id="clip0_1_396">
            <rect fill="white" height="24" width="24" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Categories() {
  return (
    <div className="absolute contents left-[13px] top-[67px]" data-name="Categories">
      <div className="absolute bg-[#d9d9d9] h-[26px] left-[270.9px] rounded-[5px] top-[67px] w-[74.099px]" />
      <div className="absolute bg-[#d9d9d9] h-[26px] left-[185.26px] rounded-[5px] top-[67px] w-[74.099px]" />
      <div className="absolute bg-[#d9d9d9] h-[26px] left-[98.65px] rounded-[5px] top-[67px] w-[74.099px]" />
      <div className="absolute bg-[#d9d9d9] h-[26px] left-[13px] rounded-[5px] top-[67px] w-[74.099px]" />
    </div>
  );
}

function BackButton() {
  return (
    <button className="absolute block cursor-pointer left-0 size-[40px] top-0" data-name="Back Button">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
        <g id="Back Button">
          <circle cx="20" cy="20" fill="var(--fill-0, #D9D9D9)" id="Ellipse 9" r="20" />
          <path d={svgPaths.pfe35100} fill="var(--stroke-0, black)" id="Arrow 1" />
        </g>
      </svg>
    </button>
  );
}

function SearchBar() {
  return (
    <div className="absolute h-[44px] left-[61px] top-0 w-[263px]" data-name="Search Bar">
      <div className="absolute flex h-[44px] items-center justify-center left-0 right-0 top-0">
        <div className="flex-none h-[44px] scale-y-[-100%] w-[263px]">
          <div className="bg-[#d9d9d9] rounded-[5px] size-full" data-name="Rectangle" />
        </div>
      </div>
      <div className="absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal h-[30px] justify-center leading-[0] left-[21px] not-italic text-[11px] text-black top-[22px] translate-y-[-50%] w-[241px]">
        <p className="css-4hzbpn leading-[normal]">Outdoor Activities</p>
      </div>
    </div>
  );
}

function TopSearchUiLayout() {
  return (
    <div className="absolute h-[93px] left-[21px] top-[66px] w-[345px]" data-name="Top Search UI layout">
      <Categories />
      <BackButton />
      <SearchBar />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute inset-[10.42%_10.42%_0.78%_10.42%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 34.0417 38.1876">
        <g id="Group">
          <g id="Vector" />
          <path d={svgPaths.p3049c5f0} fill="var(--fill-0, black)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function MingcuteAddFill() {
  return (
    <div className="absolute left-[222px] overflow-clip size-[43px] top-[25px]" data-name="mingcute:add-fill">
      <Group />
    </div>
  );
}

function BxMap() {
  return (
    <div className="absolute left-[126px] size-[45px] top-[25px]" data-name="bx:map">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 45 45">
        <g id="bx:map">
          <path d={svgPaths.p39ee4b00} fill="var(--fill-0, black)" id="Vector" />
          <path d={svgPaths.p3e90c7b0} fill="var(--fill-0, black)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute inset-[8.33%_8.33%_10.42%_8.33%]" data-name="Group">
      <div className="absolute inset-[-3.16%_-3.08%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 34.5001 33.6875">
          <g id="Group">
            <path d="M5.06254 32.6875H29.4375" id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            <path d={svgPaths.p15a3c400} id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            <path d="M1.00004 14L17.25 1L33.5 14" id="Vector_3" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            <path d={svgPaths.p30f04f80} id="Vector_4" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function LineMdHome() {
  return (
    <div className="absolute left-[34px] overflow-clip size-[39px] top-[27px]" data-name="line-md:home">
      <Group1 />
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute inset-[8.33%_8.33%_10.42%_8.33%]" data-name="Group">
      <div className="absolute inset-[-3.16%_-3.08%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 34.5001 33.6875">
          <g id="Group">
            <path d="M5.06254 32.6875H29.4375" id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            <path d={svgPaths.p15a3c400} id="Vector_2" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            <path d="M1.00004 14L17.25 1L33.5 14" id="Vector_3" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            <path d={svgPaths.p30f04f80} id="Vector_4" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function LineMdHome1() {
  return (
    <div className="absolute left-[34px] overflow-clip size-[39px] top-[27px]" data-name="line-md:home">
      <Group2 />
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute inset-[16.67%]" data-name="Group">
      <div className="absolute inset-[-3.68%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 36.5 36.5">
          <g id="Group">
            <path d={svgPaths.p24c2ea80} id="Vector" stroke="var(--stroke-0, black)" strokeLinejoin="round" strokeWidth="2.5" />
            <path d={svgPaths.p1b00ba00} id="Vector_2" stroke="var(--stroke-0, black)" strokeWidth="2.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function IconamoonProfileBold() {
  return (
    <div className="absolute left-[313px] overflow-clip size-[51px] top-[19px]" data-name="iconamoon:profile-bold">
      <Group3 />
    </div>
  );
}

function BottomUiButtons() {
  return (
    <div className="absolute h-[95px] left-0 top-[760px] w-[393px]" data-name="Bottom UI Buttons">
      <MingcuteAddFill />
      <div className="absolute bg-white border-2 border-[rgba(0,0,0,0.35)] border-solid bottom-0 h-[95px] left-1/2 translate-x-[-50%] w-[393px]" />
      <div className="absolute bottom-[12px] left-[calc(50%-142.5px)] size-[70px] translate-x-[-50%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 70 70">
          <g id="Ellipse 2">
            <circle cx="35" cy="35" fill="var(--fill-0, #D9D9D9)" r="35" />
            <circle cx="35" cy="35" r="35" stroke="var(--stroke-0, black)" />
          </g>
        </svg>
      </div>
      <div className="absolute bottom-[12px] left-[calc(50%-47.5px)] size-[70px] translate-x-[-50%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 70 70">
          <circle cx="35" cy="35" fill="var(--fill-0, #D9D9D9)" id="Ellipse 3" r="33" stroke="var(--stroke-0, black)" strokeWidth="4" />
        </svg>
      </div>
      <div className="absolute bottom-[12px] left-[calc(50%+47.5px)] size-[70px] translate-x-[-50%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 70 70">
          <circle cx="35" cy="35" fill="var(--fill-0, #D9D9D9)" id="Ellipse 3" r="35" />
        </svg>
      </div>
      <div className="absolute bottom-[12px] left-[calc(50%+142.5px)] size-[70px] translate-x-[-50%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 70 70">
          <circle cx="35" cy="35" fill="var(--fill-0, #D9D9D9)" id="Ellipse 3" r="35" />
        </svg>
      </div>
      <BxMap />
      <LineMdHome />
      <LineMdHome1 />
      <IconamoonProfileBold />
    </div>
  );
}

export default function IPhone16ActivityMapAlt() {
  return (
    <div className="bg-white relative size-full" data-name="iPhone 16 - Activity/Map Alt">
      <InteractiveMap />
      <Block />
      <Block1 />
      <div className="absolute flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[36px] justify-center leading-[0] left-[40px] not-italic text-[20px] text-black top-[630px] translate-y-[-50%] w-[140px]">
        <p className="css-4hzbpn leading-[normal]">LB Bouldering</p>
      </div>
      <div className="absolute bg-[#e5e5eb] h-[4px] left-[165px] rounded-[100px] top-[440px] w-[63px]" />
      <div className="absolute flex h-[5px] items-center justify-center left-[56px] top-[735px] w-[281px]">
        <div className="flex-none scale-y-[-100%]">
          <div className="bg-[#e5e5eb] h-[5px] rounded-[100px] w-[281px]" />
        </div>
      </div>
      <div className="absolute bg-[#d9d9d9] h-[155px] left-[40px] right-[40px] rounded-[5px] top-[457px]" />
      <div className="absolute h-[26px] left-[38px] top-[648px] w-[24px]" data-name="Star">
        <div className="absolute inset-[0_2.45%_9.55%_2.45%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22.8254 23.5172">
            <g id="Star">
              <path d={svgPaths.p38a81a80} fill="var(--fill-0, white)" />
              <path d={svgPaths.p782aa00} stroke="var(--stroke-0, black)" strokeOpacity="0.37" strokeWidth="1.5" />
            </g>
          </svg>
        </div>
      </div>
      <Component4353Reviews />
      <div className="absolute css-g0mm18 flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-[249.5px] not-italic text-[14px] text-[rgba(0,0,0,0.55)] text-center top-[661px] translate-x-[-50%] translate-y-[-50%]">
        <p className="css-ew64yg leading-[1.4]">5.8 miles</p>
      </div>
      <MapPin />
      <DollarSign />
      <TopSearchUiLayout />
      <BottomUiButtons />
    </div>
  );
}